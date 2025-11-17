"""
Portfolio service
"""
from datetime import datetime, timedelta
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException


class PortfolioService:
    """Portfolio management service"""

    GST_RATE = 0.18

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    @staticmethod
    def calculate_interest_accrued(
        face_value: float, quantity: int, coupon_rate: float, purchase_date: str
    ) -> float:
        """Calculate interest accrued"""
        years_held = (
            datetime.utcnow() - datetime.fromisoformat(purchase_date)
        ).days / 365
        interest = face_value * quantity * (coupon_rate / 100) * years_held
        return max(0, interest)

    @staticmethod
    def calculate_current_value(
        face_value: float, quantity: int, interest_accrued: float
    ) -> float:
        """Calculate current value"""
        return (face_value * quantity) + interest_accrued

    @staticmethod
    def calculate_profit_loss(current_value: float, invested_amount: float) -> dict:
        """Calculate profit/loss"""
        profit_loss = current_value - invested_amount
        profit_loss_percentage = (
            (profit_loss / invested_amount * 100) if invested_amount > 0 else 0
        )
        return {
            "profit_loss": profit_loss,
            "profit_loss_percentage": profit_loss_percentage,
        }

    @staticmethod
    def calculate_next_payout_date(
        purchase_date: str, interest_frequency: str
    ) -> Optional[str]:
        """Calculate next payout date"""
        purchase_dt = datetime.fromisoformat(purchase_date)
        now = datetime.utcnow()

        if interest_frequency == "Annual":
            next_payout = purchase_dt.replace(year=now.year + 1)
        elif interest_frequency == "Semi-Annual":
            next_payout = purchase_dt + timedelta(days=180)
        elif interest_frequency == "Quarterly":
            next_payout = purchase_dt + timedelta(days=90)
        else:
            return None

        return next_payout.isoformat()

    async def get_user_portfolio(self, user_id: str) -> List[dict]:
        """Get user's complete portfolio with calculations"""
        user_bonds = await self.db.user_bonds.find({"user_id": user_id}).to_list(1000)

        portfolio = []
        for ub in user_bonds:
            bond = await self.db.bonds.find_one({"_id": ub["bond_id"]})
            if not bond:
                continue

            # Calculate metrics
            interest_accrued = self.calculate_interest_accrued(
                bond["face_value"],
                ub["quantity"],
                bond["coupon_rate"],
                ub["purchase_date"],
            )
            current_value = self.calculate_current_value(
                bond["face_value"], ub["quantity"], interest_accrued
            )
            pl = self.calculate_profit_loss(current_value, ub["invested_amount"])

            next_payout = self.calculate_next_payout_date(
                ub["purchase_date"], bond["interest_frequency"]
            )

            portfolio.append(
                {
                    "_id": ub["_id"],
                    "bond": bond,
                    "quantity": ub["quantity"],
                    "purchase_date": ub["purchase_date"],
                    "purchase_price": ub["purchase_price"],
                    "current_value": current_value,
                    "invested_amount": ub["invested_amount"],
                    "next_payout_date": next_payout,
                    "profit_loss": pl["profit_loss"],
                    "profit_loss_percentage": pl["profit_loss_percentage"],
                }
            )

        return portfolio

    async def get_dashboard_summary(self, user_id: str) -> dict:
        """Get dashboard summary statistics"""
        user_bonds = await self.db.user_bonds.find({"user_id": user_id}).to_list(1000)

        total_invested = 0
        current_value = 0
        total_interest_earned = 0
        maturity_upcoming = 0

        for ub in user_bonds:
            total_invested += ub["invested_amount"]

            bond = await self.db.bonds.find_one({"_id": ub["bond_id"]})
            if bond:
                interest_accrued = self.calculate_interest_accrued(
                    bond["face_value"],
                    ub["quantity"],
                    bond["coupon_rate"],
                    ub["purchase_date"],
                )
                current_val = self.calculate_current_value(
                    bond["face_value"], ub["quantity"], interest_accrued
                )
                current_value += current_val
                total_interest_earned += interest_accrued

                # Check maturity
                maturity_date = datetime.fromisoformat(bond["maturity_date"])
                days_to_maturity = (maturity_date - datetime.utcnow()).days
                if 0 < days_to_maturity <= 30:
                    maturity_upcoming += 1

        pl = self.calculate_profit_loss(current_value, total_invested)

        return {
            "total_invested": total_invested,
            "current_value": current_value,
            "total_interest_earned": total_interest_earned,
            "profit_loss": pl["profit_loss"],
            "profit_loss_percentage": pl["profit_loss_percentage"],
            "total_bonds": len(user_bonds),
            "maturity_upcoming_30days": maturity_upcoming,
        }

    async def get_portfolio_chart_data(self, user_id: str) -> List[dict]:
        """Get 6-month portfolio growth data"""
        user_bonds = await self.db.user_bonds.find({"user_id": user_id}).to_list(1000)

        chart_data = []
        for i in range(6):
            date = datetime.utcnow() - timedelta(days=30 * (5 - i))
            value = 0

            for ub in user_bonds:
                bond = await self.db.bonds.find_one({"_id": ub["bond_id"]})
                if bond:
                    purchase_dt = datetime.fromisoformat(ub["purchase_date"])
                    years_held = max(0, (date - purchase_dt).days / 365)
                    interest = (
                        bond["face_value"]
                        * ub["quantity"]
                        * (bond["coupon_rate"] / 100)
                        * years_held
                    )
                    value += (bond["face_value"] * ub["quantity"]) + interest

            chart_data.append({"date": date.strftime("%b %Y"), "value": value})

        return chart_data

    async def get_bond_detail(self, bond_id: str, user_id: str) -> dict:
        """Get bond detail with user data if owned"""
        bond = await self.db.bonds.find_one({"_id": bond_id})
        if not bond:
            raise HTTPException(status_code=404, detail="Bond not found")

        user_bond = await self.db.user_bonds.find_one(
            {"user_id": user_id, "bond_id": bond_id}
        )

        result = {"bond": bond, "user_bond": None}

        if user_bond:
            interest_accrued = self.calculate_interest_accrued(
                bond["face_value"],
                user_bond["quantity"],
                bond["coupon_rate"],
                user_bond["purchase_date"],
            )
            current_value = self.calculate_current_value(
                bond["face_value"], user_bond["quantity"], interest_accrued
            )
            pl = self.calculate_profit_loss(current_value, user_bond["invested_amount"])

            result["user_bond"] = {
                **user_bond,
                "current_value": current_value,
                "profit_loss": pl["profit_loss"],
                "interest_accrued": interest_accrued,
            }

        return result

    async def get_all_bonds(self) -> List[dict]:
        """Get all available bonds"""
        bonds = await self.db.bonds.find().to_list(1000)
        return bonds

    async def get_maturity_calendar(self, user_id: str) -> List[dict]:
        """Get maturity calendar"""
        user_bonds = await self.db.user_bonds.find({"user_id": user_id}).to_list(1000)

        maturity_items = []
        for ub in user_bonds:
            bond = await self.db.bonds.find_one({"_id": ub["bond_id"]})
            if bond:
                maturity_date = datetime.fromisoformat(bond["maturity_date"])
                days_to_maturity = (maturity_date - datetime.utcnow()).days

                maturity_items.append(
                    {
                        "bond_name": bond["name"],
                        "isin": bond["isin"],
                        "maturity_date": bond["maturity_date"],
                        "days_remaining": days_to_maturity,
                        "face_value": bond["face_value"],
                        "quantity": ub["quantity"],
                        "maturity_amount": bond["face_value"] * ub["quantity"],
                    }
                )

        # Sort by maturity date
        maturity_items.sort(key=lambda x: x["maturity_date"])
        return maturity_items
