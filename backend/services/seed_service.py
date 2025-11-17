"""
Data seeding service
"""
import uuid
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase


class SeedService:
    """Service for seeding sample data"""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def seed_sample_data(self, user_id: str):
        """Create sample bond data for new users"""

        sample_bonds = [
            {
                "_id": str(uuid.uuid4()),
                "isin": "INE002A08186",
                "name": "Government of India 7.26% 2029",
                "bond_type": "G-Sec",
                "issuer": "Government of India",
                "face_value": 100000,
                "coupon_rate": 7.26,
                "maturity_date": "2029-12-15",
                "ratings": {
                    "crisil": "AAA",
                    "icra": "AAA",
                    "care": "AAA",
                    "india_ratings": "AAA",
                },
                "interest_frequency": "Semi-Annual",
                "is_secured": True,
                "category": "Sovereign",
                "yield_to_maturity": 7.35,
                "description": "Government of India sovereign bond with semi-annual coupon payments. Backed by sovereign guarantee.",
            },
            {
                "_id": str(uuid.uuid4()),
                "isin": "INE001A07RH1",
                "name": "HDFC Bank Ltd. 8.05% 2028",
                "bond_type": "Corporate",
                "issuer": "HDFC Bank",
                "face_value": 100000,
                "coupon_rate": 8.05,
                "maturity_date": "2028-06-20",
                "ratings": {
                    "crisil": "AAA",
                    "icra": "AAA",
                    "care": "AAA",
                    "india_ratings": "AAA",
                },
                "interest_frequency": "Annual",
                "is_secured": False,
                "category": "Unsecured",
                "yield_to_maturity": 8.15,
                "description": "Senior unsecured notes issued by HDFC Bank. Annual interest payment with AAA rating.",
            },
            {
                "_id": str(uuid.uuid4()),
                "isin": "INE020B08BN6",
                "name": "State Bank of India 7.72% 2030",
                "bond_type": "Corporate",
                "issuer": "State Bank of India",
                "face_value": 100000,
                "coupon_rate": 7.72,
                "maturity_date": "2030-03-25",
                "ratings": {
                    "crisil": "AAA",
                    "icra": "AAA",
                    "care": "AAA",
                    "india_ratings": "AAA",
                },
                "interest_frequency": "Annual",
                "is_secured": True,
                "category": "Secured",
                "yield_to_maturity": 7.82,
                "description": "Tier II capital bonds issued by State Bank of India. Secured with bank assets.",
            },
            {
                "_id": str(uuid.uuid4()),
                "isin": "INE053A08037",
                "name": "REC Ltd. 8.30% 2027",
                "bond_type": "Corporate",
                "issuer": "Rural Electrification Corporation",
                "face_value": 100000,
                "coupon_rate": 8.30,
                "maturity_date": "2027-09-10",
                "ratings": {
                    "crisil": "AAA",
                    "icra": "AAA",
                    "care": "AAA",
                    "india_ratings": "AAA",
                },
                "interest_frequency": "Annual",
                "is_secured": True,
                "category": "Secured",
                "yield_to_maturity": 8.42,
                "description": "Tax-free bonds issued by REC Ltd. for infrastructure financing.",
            },
            {
                "_id": str(uuid.uuid4()),
                "isin": "IN0020140028",
                "name": "Maharashtra SDL 7.38% 2031",
                "bond_type": "SDL",
                "issuer": "Government of Maharashtra",
                "face_value": 100000,
                "coupon_rate": 7.38,
                "maturity_date": "2031-12-20",
                "ratings": {
                    "crisil": "AAA",
                    "icra": "AAA",
                    "care": "AAA",
                    "india_ratings": "AAA",
                },
                "interest_frequency": "Semi-Annual",
                "is_secured": True,
                "category": "State Government",
                "yield_to_maturity": 7.45,
                "description": "State Development Loan issued by Maharashtra Government. Sovereign-backed with semi-annual payments.",
            },
        ]

        # Insert bonds if not already present
        existing_bonds = await self.db.bonds.count_documents({})
        if existing_bonds == 0:
            await self.db.bonds.insert_many(sample_bonds)

        # Create user bond holdings
        user_bonds = []
        for i, bond in enumerate(sample_bonds[:3]):  # User owns first 3 bonds
            quantity = [10, 5, 8][i]
            purchase_price = bond["face_value"] * (1 + (i * 0.02))

            user_bonds.append(
                {
                    "_id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "bond_id": bond["_id"],
                    "quantity": quantity,
                    "purchase_date": f"2024-0{i+1}-15",
                    "purchase_price": purchase_price,
                    "invested_amount": purchase_price * quantity,
                }
            )

        await self.db.user_bonds.insert_many(user_bonds)

        # Create sample transactions
        transactions = []
        for i, ub in enumerate(user_bonds):
            bond = sample_bonds[i]
            transactions.append(
                {
                    "_id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "bond_id": bond["_id"],
                    "bond_name": bond["name"],
                    "isin": bond["isin"],
                    "transaction_type": "Buy",
                    "quantity": ub["quantity"],
                    "price": ub["purchase_price"],
                    "total_amount": ub["invested_amount"],
                    "gst_amount": ub["invested_amount"] * 0.18,
                    "date": ub["purchase_date"],
                    "contract_note": None,
                }
            )

        await self.db.transactions.insert_many(transactions)

        # Create sample notifications
        notifications = [
            {
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "type": "interest_payout",
                "title": "Interest Payment Received",
                "message": f"₹{7260:.2f} interest credited for Government of India 7.26% 2029",
                "date": datetime.utcnow().isoformat(),
                "is_read": False,
            },
            {
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "type": "maturity_alert",
                "title": "Upcoming Maturity",
                "message": "REC Ltd. 8.30% 2027 is maturing in 90 days",
                "date": (datetime.utcnow() - timedelta(days=2)).isoformat(),
                "is_read": True,
            },
        ]

        await self.db.notifications.insert_many(notifications)
