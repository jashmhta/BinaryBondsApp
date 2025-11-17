"""
Database connection and initialization
"""
import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from backend.config import settings

logger = logging.getLogger(__name__)

# Global database client
_client: Optional[AsyncIOMotorClient] = None
_database: Optional[AsyncIOMotorDatabase] = None


def get_db_client() -> AsyncIOMotorClient:
    """Get MongoDB client instance"""
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(
            settings.MONGO_URL,
            maxPoolSize=50,
            minPoolSize=10,
            serverSelectionTimeoutMS=5000,
        )
        logger.info(f"Connected to MongoDB at {settings.MONGO_URL}")
    return _client


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    global _database
    if _database is None:
        client = get_db_client()
        _database = client[settings.DB_NAME]
        logger.info(f"Using database: {settings.DB_NAME}")
    return _database


async def close_db_connection():
    """Close database connection"""
    global _client, _database
    if _client:
        _client.close()
        _client = None
        _database = None
        logger.info("Closed MongoDB connection")


async def init_db():
    """Initialize database with indexes"""
    db = get_database()

    # Create indexes for users collection
    await db.users.create_index("email", unique=True)
    logger.info("Created index on users.email")

    # Create indexes for bonds collection
    await db.bonds.create_index("isin", unique=True)
    await db.bonds.create_index("bond_type")
    await db.bonds.create_index("issuer")
    logger.info("Created indexes on bonds collection")

    # Create indexes for user_bonds collection
    await db.user_bonds.create_index("user_id")
    await db.user_bonds.create_index("bond_id")
    await db.user_bonds.create_index([("user_id", 1), ("bond_id", 1)], unique=True)
    logger.info("Created indexes on user_bonds collection")

    # Create indexes for transactions collection
    await db.transactions.create_index("user_id")
    await db.transactions.create_index([("user_id", 1), ("date", -1)])
    await db.transactions.create_index("date")
    logger.info("Created indexes on transactions collection")

    # Create indexes for notifications collection
    await db.notifications.create_index("user_id")
    await db.notifications.create_index([("user_id", 1), ("date", -1)])
    await db.notifications.create_index("is_read")
    logger.info("Created indexes on notifications collection")

    logger.info("Database initialization complete")
