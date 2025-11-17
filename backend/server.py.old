from fastapi import FastAPI, APIRouter, HTTPException, Depends, Body, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import Response, FileResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from pathlib import Path
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import logging
import uuid
import base64
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PINSetup(BaseModel):
    pin: str

class PINVerify(BaseModel):
    pin: str

class Token(BaseModel):
    access_token: str
    token_type: str

class DashboardSummary(BaseModel):
    total_invested: float
    current_value: float
    total_interest_earned: float
    profit_loss: float
    profit_loss_percentage: float
    total_bonds: int
    maturity_upcoming_30days: int

class ChartDataPoint(BaseModel):
    date: str
    value: float

class BondRatings(BaseModel):
    crisil: Optional[str] = None
    icra: Optional[str] = None
    care: Optional[str] = None
    india_ratings: Optional[str] = None

class Bond(BaseModel):
    id: str = Field(alias="_id")
    isin: str
    name: str
    bond_type: str  # G-Sec, Corporate, SDL, Tax-Free
    issuer: str
    face_value: float
    coupon_rate: float
    maturity_date: str
    ratings: BondRatings
    interest_frequency: str  # Annual, Semi-Annual, Quarterly
    is_secured: bool
    category: str  # Secured/Unsecured
    yield_to_maturity: float
    description: str

    class Config:
        populate_by_name = True

class UserBond(BaseModel):
    id: str = Field(alias="_id")
    bond: Bond
    quantity: int
    purchase_date: str
    purchase_price: float
    current_value: float
    invested_amount: float
    next_payout_date: Optional[str] = None
    profit_loss: float
    profit_loss_percentage: float

    class Config:
        populate_by_name = True

class Transaction(BaseModel):
    id: str = Field(alias="_id")
    bond_name: str
    isin: str
    transaction_type: str  # Buy, Sell
    quantity: int
    price: float
    total_amount: float
    gst_amount: float
    date: str
    contract_note: Optional[str] = None  # base64

    class Config:
        populate_by_name = True

class TransactionCreate(BaseModel):
    bond_id: str
    transaction_type: str
    quantity: int
    price: float
    date: str
    contract_note: Optional[str] = None

class Notification(BaseModel):
    id: str = Field(alias="_id")
    type: str  # interest_payout, maturity_alert, rating_change
    title: str
    message: str
    date: str
    is_read: bool

    class Config:
        populate_by_name = True

# ==================== AUTH HELPERS ====================

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ==================== SEED DATA ====================

async def seed_sample_data(user_id: str):
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
            "ratings": {"crisil": "AAA", "icra": "AAA", "care": "AAA", "india_ratings": "AAA"},
            "interest_frequency": "Semi-Annual",
            "is_secured": True,
            "category": "Sovereign",
            "yield_to_maturity": 7.35,
            "description": "Government of India sovereign bond with semi-annual coupon payments. Backed by sovereign guarantee."
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
            "ratings": {"crisil": "AAA", "icra": "AAA", "care": "AAA", "india_ratings": "AAA"},
            "interest_frequency": "Annual",
            "is_secured": False,
            "category": "Unsecured",
            "yield_to_maturity": 8.15,
            "description": "Senior unsecured notes issued by HDFC Bank. Annual interest payment with AAA rating."
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
            "ratings": {"crisil": "AAA", "icra": "AAA", "care": "AAA", "india_ratings": "AAA"},
            "interest_frequency": "Annual",
            "is_secured": True,
            "category": "Secured",
            "yield_to_maturity": 7.82,
            "description": "Tier II capital bonds issued by State Bank of India. Secured with bank assets."
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
            "ratings": {"crisil": "AAA", "icra": "AAA", "care": "AAA", "india_ratings": "AAA"},
            "interest_frequency": "Annual",
            "is_secured": True,
            "category": "Secured",
            "yield_to_maturity": 8.42,
            "description": "Tax-free bonds issued by REC Ltd. for infrastructure financing."
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
            "ratings": {"crisil": "AAA", "icra": "AAA", "care": "AAA", "india_ratings": "AAA"},
            "interest_frequency": "Semi-Annual",
            "is_secured": True,
            "category": "State Government",
            "yield_to_maturity": 7.45,
            "description": "State Development Loan issued by Maharashtra Government. Sovereign-backed with semi-annual payments."
        }
    ]
    
    # Insert bonds
    existing_bonds = await db.bonds.count_documents({})
    if existing_bonds == 0:
        await db.bonds.insert_many(sample_bonds)
    
    # Create user bond holdings
    user_bonds = []
    for i, bond in enumerate(sample_bonds[:3]):  # User owns first 3 bonds
        quantity = [10, 5, 8][i]
        purchase_price = bond["face_value"] * (1 + (i * 0.02))  # Slight variation
        
        user_bonds.append({
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "bond_id": bond["_id"],
            "quantity": quantity,
            "purchase_date": f"2024-0{i+1}-15",
            "purchase_price": purchase_price,
            "invested_amount": purchase_price * quantity
        })
    
    await db.user_bonds.insert_many(user_bonds)
    
    # Create sample transactions
    transactions = []
    for i, ub in enumerate(user_bonds):
        bond = sample_bonds[i]
        transactions.append({
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
            "contract_note": None
        })
    
    await db.transactions.insert_many(transactions)
    
    # Create sample notifications
    notifications = [
        {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": "interest_payout",
            "title": "Interest Payment Received",
            "message": f"₹{7260:.2f} interest credited for Government of India 7.26% 2029",
            "date": datetime.utcnow().isoformat(),
            "is_read": False
        },
        {
            "_id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": "maturity_alert",
            "title": "Upcoming Maturity",
            "message": "REC Ltd. 8.30% 2027 is maturing in 90 days",
            "date": (datetime.utcnow() - timedelta(days=2)).isoformat(),
            "is_read": True
        }
    ]
    
    await db.notifications.insert_many(notifications)

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    user = {
        "_id": user_id,
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "name": user_data.name,
        "phone": user_data.phone,
        "pin_hash": None,
        "created_at": datetime.utcnow().isoformat(),
        "preferences": {
            "theme": "dark",
            "notifications_enabled": True
        }
    }
    
    await db.users.insert_one(user)
    
    # Seed sample data
    await seed_sample_data(user_id)
    
    # Create token
    access_token = create_access_token(data={"sub": user_data.email})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": credentials.email})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/set-pin")
async def set_pin(pin_data: PINSetup, current_user: dict = Depends(get_current_user)):
    if len(pin_data.pin) != 4 or not pin_data.pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be 4 digits")
    
    pin_hash = get_password_hash(pin_data.pin)
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"pin_hash": pin_hash}}
    )
    
    return {"success": True, "message": "PIN set successfully"}

@api_router.post("/auth/verify-pin")
async def verify_pin(pin_data: PINVerify, current_user: dict = Depends(get_current_user)):
    if not current_user.get("pin_hash"):
        raise HTTPException(status_code=400, detail="PIN not set")
    
    if not verify_password(pin_data.pin, current_user["pin_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect PIN")
    
    return {"success": True, "message": "PIN verified"}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["_id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "phone": current_user.get("phone"),
        "has_pin": current_user.get("pin_hash") is not None,
        "preferences": current_user.get("preferences", {})
    }

# ==================== DASHBOARD ROUTES ====================

@api_router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    # Get user bonds
    user_bonds = await db.user_bonds.find({"user_id": current_user["_id"]}).to_list(1000)
    
    total_invested = 0
    current_value = 0
    total_interest_earned = 0
    maturity_upcoming = 0
    
    for ub in user_bonds:
        total_invested += ub["invested_amount"]
        
        # Get bond details
        bond = await db.bonds.find_one({"_id": ub["bond_id"]})
        if bond:
            # Calculate current value (face value * quantity + interest accrued)
            years_held = (datetime.utcnow() - datetime.fromisoformat(ub["purchase_date"])).days / 365
            interest_accrued = bond["face_value"] * ub["quantity"] * (bond["coupon_rate"] / 100) * years_held
            current_val = (bond["face_value"] * ub["quantity"]) + interest_accrued
            current_value += current_val
            total_interest_earned += interest_accrued
            
            # Check maturity
            maturity_date = datetime.fromisoformat(bond["maturity_date"])
            days_to_maturity = (maturity_date - datetime.utcnow()).days
            if 0 < days_to_maturity <= 30:
                maturity_upcoming += 1
    
    profit_loss = current_value - total_invested
    profit_loss_percentage = (profit_loss / total_invested * 100) if total_invested > 0 else 0
    
    return {
        "total_invested": total_invested,
        "current_value": current_value,
        "total_interest_earned": total_interest_earned,
        "profit_loss": profit_loss,
        "profit_loss_percentage": profit_loss_percentage,
        "total_bonds": len(user_bonds),
        "maturity_upcoming_30days": maturity_upcoming
    }

@api_router.get("/dashboard/chart", response_model=List[ChartDataPoint])
async def get_dashboard_chart(current_user: dict = Depends(get_current_user)):
    # Generate chart data for last 6 months
    chart_data = []
    user_bonds = await db.user_bonds.find({"user_id": current_user["_id"]}).to_list(1000)
    
    for i in range(6):
        date = datetime.utcnow() - timedelta(days=30 * (5 - i))
        value = 0
        
        for ub in user_bonds:
            bond = await db.bonds.find_one({"_id": ub["bond_id"]})
            if bond:
                years_held = max(0, (date - datetime.fromisoformat(ub["purchase_date"])).days / 365)
                interest = bond["face_value"] * ub["quantity"] * (bond["coupon_rate"] / 100) * years_held
                value += (bond["face_value"] * ub["quantity"]) + interest
        
        chart_data.append({
            "date": date.strftime("%b %Y"),
            "value": value
        })
    
    return chart_data

# ==================== PORTFOLIO ROUTES ====================

@api_router.get("/portfolio/list", response_model=List[UserBond])
async def get_portfolio(current_user: dict = Depends(get_current_user)):
    user_bonds = await db.user_bonds.find({"user_id": current_user["_id"]}).to_list(1000)
    
    result = []
    for ub in user_bonds:
        bond = await db.bonds.find_one({"_id": ub["bond_id"]})
        if bond:
            # Calculate current value and P&L
            years_held = (datetime.utcnow() - datetime.fromisoformat(ub["purchase_date"])).days / 365
            interest_accrued = bond["face_value"] * ub["quantity"] * (bond["coupon_rate"] / 100) * years_held
            current_value = (bond["face_value"] * ub["quantity"]) + interest_accrued
            profit_loss = current_value - ub["invested_amount"]
            profit_loss_percentage = (profit_loss / ub["invested_amount"] * 100) if ub["invested_amount"] > 0 else 0
            
            # Calculate next payout date
            next_payout = None
            if bond["interest_frequency"] == "Annual":
                purchase_date = datetime.fromisoformat(ub["purchase_date"])
                next_payout = purchase_date.replace(year=datetime.utcnow().year + 1).isoformat()
            elif bond["interest_frequency"] == "Semi-Annual":
                purchase_date = datetime.fromisoformat(ub["purchase_date"])
                next_payout = (purchase_date + timedelta(days=180)).isoformat()
            
            result.append({
                "_id": ub["_id"],
                "bond": {
                    "_id": bond["_id"],
                    **bond
                },
                "quantity": ub["quantity"],
                "purchase_date": ub["purchase_date"],
                "purchase_price": ub["purchase_price"],
                "current_value": current_value,
                "invested_amount": ub["invested_amount"],
                "next_payout_date": next_payout,
                "profit_loss": profit_loss,
                "profit_loss_percentage": profit_loss_percentage
            })
    
    return result

@api_router.get("/portfolio/bond/{bond_id}")
async def get_bond_detail(bond_id: str, current_user: dict = Depends(get_current_user)):
    # Get bond
    bond = await db.bonds.find_one({"_id": bond_id})
    if not bond:
        raise HTTPException(status_code=404, detail="Bond not found")
    
    # Get user bond if owned
    user_bond = await db.user_bonds.find_one({"user_id": current_user["_id"], "bond_id": bond_id})
    
    result = {"bond": bond, "user_bond": None}
    
    if user_bond:
        years_held = (datetime.utcnow() - datetime.fromisoformat(user_bond["purchase_date"])).days / 365
        interest_accrued = bond["face_value"] * user_bond["quantity"] * (bond["coupon_rate"] / 100) * years_held
        current_value = (bond["face_value"] * user_bond["quantity"]) + interest_accrued
        profit_loss = current_value - user_bond["invested_amount"]
        
        result["user_bond"] = {
            **user_bond,
            "current_value": current_value,
            "profit_loss": profit_loss,
            "interest_accrued": interest_accrued
        }
    
    return result

@api_router.get("/portfolio/all-bonds", response_model=List[Bond])
async def get_all_bonds():
    bonds = await db.bonds.find().to_list(1000)
    return bonds

# ==================== TRANSACTION ROUTES ====================

@api_router.get("/transactions/list", response_model=List[Transaction])
async def get_transactions(current_user: dict = Depends(get_current_user)):
    transactions = await db.transactions.find({"user_id": current_user["_id"]}).sort("date", -1).to_list(1000)
    return transactions

@api_router.post("/transactions/create")
async def create_transaction(transaction: TransactionCreate, current_user: dict = Depends(get_current_user)):
    # Get bond
    bond = await db.bonds.find_one({"_id": transaction.bond_id})
    if not bond:
        raise HTTPException(status_code=404, detail="Bond not found")
    
    total_amount = transaction.price * transaction.quantity
    gst_amount = total_amount * 0.18
    
    # Create transaction
    transaction_doc = {
        "_id": str(uuid.uuid4()),
        "user_id": current_user["_id"],
        "bond_id": transaction.bond_id,
        "bond_name": bond["name"],
        "isin": bond["isin"],
        "transaction_type": transaction.transaction_type,
        "quantity": transaction.quantity,
        "price": transaction.price,
        "total_amount": total_amount,
        "gst_amount": gst_amount,
        "date": transaction.date,
        "contract_note": transaction.contract_note
    }
    
    await db.transactions.insert_one(transaction_doc)
    
    # Update user bond holding
    if transaction.transaction_type == "Buy":
        existing_bond = await db.user_bonds.find_one({
            "user_id": current_user["_id"],
            "bond_id": transaction.bond_id
        })
        
        if existing_bond:
            # Update quantity and invested amount
            new_quantity = existing_bond["quantity"] + transaction.quantity
            new_invested = existing_bond["invested_amount"] + total_amount
            
            await db.user_bonds.update_one(
                {"_id": existing_bond["_id"]},
                {"$set": {
                    "quantity": new_quantity,
                    "invested_amount": new_invested,
                    "purchase_price": new_invested / new_quantity
                }}
            )
        else:
            # Create new holding
            await db.user_bonds.insert_one({
                "_id": str(uuid.uuid4()),
                "user_id": current_user["_id"],
                "bond_id": transaction.bond_id,
                "quantity": transaction.quantity,
                "purchase_date": transaction.date,
                "purchase_price": transaction.price,
                "invested_amount": total_amount
            })
    
    return {"success": True, "transaction_id": transaction_doc["_id"]}

# ==================== REPORTS ROUTES ====================

@api_router.get("/reports/portfolio-summary")
async def get_portfolio_summary_report(current_user: dict = Depends(get_current_user)):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    from io import BytesIO
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    styles = getSampleStyleSheet()
    
    # Title
    elements.append(Paragraph("<b>Binary Bonds - Portfolio Summary</b>", styles['Title']))
    elements.append(Paragraph(f"Generated on: {datetime.utcnow().strftime('%d/%m/%Y')}", styles['Normal']))
    elements.append(Spacer(1, 0.3 * inch))
    
    # User info
    elements.append(Paragraph(f"<b>Client Name:</b> {current_user['name']}", styles['Normal']))
    elements.append(Paragraph(f"<b>Email:</b> {current_user['email']}", styles['Normal']))
    elements.append(Spacer(1, 0.3 * inch))
    
    # Get portfolio data
    user_bonds = await db.user_bonds.find({"user_id": current_user["_id"]}).to_list(1000)
    
    # Table data
    table_data = [["Bond Name", "ISIN", "Quantity", "Face Value", "Invested Amount"]]
    
    total_invested = 0
    for ub in user_bonds:
        bond = await db.bonds.find_one({"_id": ub["bond_id"]})
        if bond:
            table_data.append([
                bond["name"][:30],
                bond["isin"],
                str(ub["quantity"]),
                f"₹{bond['face_value']:,.0f}",
                f"₹{ub['invested_amount']:,.0f}"
            ])
            total_invested += ub["invested_amount"]
    
    table_data.append(["", "", "", "Total", f"₹{total_invested:,.0f}"])
    
    table = Table(table_data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    buffer.seek(0)
    return Response(content=buffer.read(), media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=portfolio_summary.pdf"
    })

@api_router.get("/reports/maturity-calendar")
async def get_maturity_calendar(current_user: dict = Depends(get_current_user)):
    user_bonds = await db.user_bonds.find({"user_id": current_user["_id"]}).to_list(1000)
    
    maturity_items = []
    for ub in user_bonds:
        bond = await db.bonds.find_one({"_id": ub["bond_id"]})
        if bond:
            maturity_date = datetime.fromisoformat(bond["maturity_date"])
            days_to_maturity = (maturity_date - datetime.utcnow()).days
            
            maturity_items.append({
                "bond_name": bond["name"],
                "isin": bond["isin"],
                "maturity_date": bond["maturity_date"],
                "days_remaining": days_to_maturity,
                "face_value": bond["face_value"],
                "quantity": ub["quantity"],
                "maturity_amount": bond["face_value"] * ub["quantity"]
            })
    
    # Sort by maturity date
    maturity_items.sort(key=lambda x: x["maturity_date"])
    
    return maturity_items

# ==================== NOTIFICATIONS ROUTES ====================

@api_router.get("/notifications/list", response_model=List[Notification])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find({"user_id": current_user["_id"]}).sort("date", -1).to_list(1000)
    return notifications

@api_router.post("/notifications/mark-read/{notification_id}")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"_id": notification_id, "user_id": current_user["_id"]},
        {"$set": {"is_read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"success": True}

@api_router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    await db.notifications.update_many(
        {"user_id": current_user["_id"]},
        {"$set": {"is_read": True}}
    )
    return {"success": True}

# ==================== USER PREFERENCES ====================

@api_router.post("/user/update-theme")
async def update_theme(theme: str = Body(..., embed=True), current_user: dict = Depends(get_current_user)):
    if theme not in ["dark", "light"]:
        raise HTTPException(status_code=400, detail="Invalid theme")
    
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"preferences.theme": theme}}
    )
    
    return {"success": True}

# ==================== APP SETUP ====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)