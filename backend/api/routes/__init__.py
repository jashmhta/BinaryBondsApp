"""
API routes modules
"""
from .auth import router as auth_router
from .dashboard import router as dashboard_router
from .portfolio import router as portfolio_router
from .transactions import router as transactions_router
from .reports import router as reports_router
from .notifications import router as notifications_router
from .user import router as user_router

__all__ = [
    "auth_router",
    "dashboard_router",
    "portfolio_router",
    "transactions_router",
    "reports_router",
    "notifications_router",
    "user_router",
]
