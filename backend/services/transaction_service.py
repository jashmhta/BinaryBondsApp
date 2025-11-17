"""
Transaction service
"""
import uuid
from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException


class TransactionService:
    """Transaction management service"""

    GST_RATE = 0.18

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_user_transactions(self, user_id: str) -> List[dict]:
        """Get user transaction history"""
        transactions = (
            await self.db.transactions.find({"user_id": user_id})
            .sort("date", -1)
            .to_list(1000)
        )
        return transactions

    async def create_transaction(
        self,
        user_id: str,
        bond_id: str,
        transaction_type: str,
        quantity: int,
        price: float,
        date: str,
        contract_note: str = None,
    ) -> dict:
        """Create a new transaction"""
        # Validate bond exists
        bond = await self.db.bonds.find_one({"_id": bond_id})
        if not bond:
            raise HTTPException(status_code=404, detail="Bond not found")

        # Calculate amounts
        total_amount = price * quantity
        gst_amount = total_amount * self.GST_RATE

        # Create transaction document
        transaction_doc = {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "bond_id": bond_id,
            "bond_name": bond["name"],
            "isin": bond["isin"],
            "transaction_type": transaction_type,
            "quantity": quantity,
            "price": price,
            "total_amount": total_amount,
            "gst_amount": gst_amount,
            "date": date,
            "contract_note": contract_note,
        }

        await self.db.transactions.insert_one(transaction_doc)

        # Update user bond holdings
        if transaction_type == "Buy":
            await self._update_holdings_buy(
                user_id, bond_id, quantity, price, total_amount, date
            )
        elif transaction_type == "Sell":
            await self._update_holdings_sell(user_id, bond_id, quantity)

        return {
            "success": True,
            "transaction_id": transaction_doc["_id"],
            "message": f"{transaction_type} transaction created successfully",
        }

    async def _update_holdings_buy(
        self,
        user_id: str,
        bond_id: str,
        quantity: int,
        price: float,
        total_amount: float,
        date: str,
    ):
        """Update holdings on buy transaction"""
        existing_bond = await self.db.user_bonds.find_one(
            {"user_id": user_id, "bond_id": bond_id}
        )

        if existing_bond:
            # Update existing holding
            new_quantity = existing_bond["quantity"] + quantity
            new_invested = existing_bond["invested_amount"] + total_amount

            await self.db.user_bonds.update_one(
                {"_id": existing_bond["_id"]},
                {
                    "$set": {
                        "quantity": new_quantity,
                        "invested_amount": new_invested,
                        "purchase_price": new_invested / new_quantity,
                    }
                },
            )
        else:
            # Create new holding
            await self.db.user_bonds.insert_one(
                {
                    "_id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "bond_id": bond_id,
                    "quantity": quantity,
                    "purchase_date": date,
                    "purchase_price": price,
                    "invested_amount": total_amount,
                }
            )

    async def _update_holdings_sell(
        self, user_id: str, bond_id: str, quantity: int
    ):
        """Update holdings on sell transaction"""
        existing_bond = await self.db.user_bonds.find_one(
            {"user_id": user_id, "bond_id": bond_id}
        )

        if not existing_bond:
            raise HTTPException(
                status_code=400, detail="Cannot sell bond you don't own"
            )

        if existing_bond["quantity"] < quantity:
            raise HTTPException(
                status_code=400, detail="Insufficient quantity to sell"
            )

        new_quantity = existing_bond["quantity"] - quantity

        if new_quantity == 0:
            # Remove holding completely
            await self.db.user_bonds.delete_one({"_id": existing_bond["_id"]})
        else:
            # Update quantity and invested amount proportionally
            proportion = new_quantity / existing_bond["quantity"]
            new_invested = existing_bond["invested_amount"] * proportion

            await self.db.user_bonds.update_one(
                {"_id": existing_bond["_id"]},
                {
                    "$set": {
                        "quantity": new_quantity,
                        "invested_amount": new_invested,
                    }
                },
            )
