# BinaryBonds API

Production-ready RESTful API for Bond Portfolio Management in Indian Markets.

## 🏗️ Architecture

This backend follows a **clean, modular architecture** with clear separation of concerns:

```
backend/
├── api/                    # API layer
│   ├── routes/            # Route handlers by domain
│   └── dependencies.py    # Shared dependencies (auth, db)
│
├── models/                # Pydantic data models
│   ├── user.py
│   ├── bond.py
│   ├── transaction.py
│   └── ...
│
├── services/              # Business logic layer
│   ├── auth_service.py
│   ├── portfolio_service.py
│   ├── transaction_service.py
│   └── ...
│
├── database/              # Database layer
│   ├── connection.py      # MongoDB connection & pooling
│   └── __init__.py
│
├── tests/                 # Test suite
│   ├── test_auth.py
│   ├── test_portfolio.py
│   └── conftest.py
│
├── config.py              # Configuration management
├── app.py                 # Main FastAPI application
└── requirements.txt       # Python dependencies
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- MongoDB 5.0+
- pip or Poetry

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and set your SECRET_KEY and MONGO_URL
   ```

5. **Run the application**
   ```bash
   python -m backend.app
   # Or use uvicorn directly:
   uvicorn backend.app:app --reload
   ```

6. **Access API documentation**
   - Swagger UI: http://localhost:8001/docs
   - ReDoc: http://localhost:8001/redoc

## 🧪 Testing

Run tests with pytest:

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=backend --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::TestAuth::test_register
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/set-pin` - Set security PIN
- `POST /api/auth/verify-pin` - Verify PIN

### Dashboard
- `GET /api/dashboard/summary` - Get portfolio summary
- `GET /api/dashboard/chart` - Get 6-month growth chart

### Portfolio
- `GET /api/portfolio/list` - Get user's bonds
- `GET /api/portfolio/bond/{id}` - Get bond detail
- `GET /api/portfolio/all-bonds` - Get all available bonds

### Transactions
- `GET /api/transactions/list` - Get transaction history
- `POST /api/transactions/create` - Create transaction

### Reports
- `GET /api/reports/portfolio-summary` - Generate PDF report
- `GET /api/reports/maturity-calendar` - Get maturity calendar

### Notifications
- `GET /api/notifications/list` - Get notifications
- `POST /api/notifications/mark-read/{id}` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read

### User
- `POST /api/user/update-theme` - Update theme preference

## 🔒 Security Features

- ✅ **JWT Authentication** with configurable expiration
- ✅ **Password Hashing** using bcrypt
- ✅ **PIN Protection** for sensitive operations
- ✅ **CORS Configuration** with whitelist
- ✅ **Environment-based Secrets** (no hardcoded keys)
- ✅ **Input Validation** with Pydantic
- ✅ **Rate Limiting** support (configurable)

## 🗄️ Database

### Collections

1. **users** - User accounts and preferences
2. **bonds** - Available bonds (G-Sec, Corporate, SDL, Tax-Free)
3. **user_bonds** - User holdings
4. **transactions** - Buy/Sell transactions
5. **notifications** - User notifications

### Indexes

All collections have optimized indexes:
- `users`: email (unique)
- `bonds`: isin (unique), bond_type, issuer
- `user_bonds`: user_id, bond_id, (user_id, bond_id) compound
- `transactions`: user_id, (user_id, date) compound
- `notifications`: user_id, (user_id, date) compound, is_read

## 📊 Code Quality

```bash
# Format code
black backend/

# Sort imports
isort backend/

# Lint code
flake8 backend/

# Type check
mypy backend/
```

## 🚢 Deployment

### Using Uvicorn

```bash
uvicorn backend.app:app --host 0.0.0.0 --port 8001 --workers 4
```

### Using Gunicorn

```bash
gunicorn backend.app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

### Docker (Recommended)

```bash
docker build -t binarybonds-api .
docker run -p 8001:8001 --env-file .env binarybonds-api
```

## 🔧 Configuration

All configuration is managed through environment variables (see `.env.example`):

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | JWT secret key (min 32 chars) | Yes |
| `MONGO_URL` | MongoDB connection string | Yes |
| `DB_NAME` | Database name | Yes |
| `CORS_ORIGINS` | Allowed CORS origins (JSON array) | No |
| `DEBUG` | Enable debug mode | No |
| `ACCESS_TOKEN_EXPIRE_DAYS` | Token expiration | No |

## 📈 Performance

- **Connection Pooling**: MongoDB pool (10-50 connections)
- **Async Operations**: All I/O operations are async
- **Database Indexes**: Optimized queries with proper indexes
- **Response Caching**: Ready for Redis integration

## 🤝 Contributing

1. Follow PEP 8 style guide
2. Write tests for new features
3. Update documentation
4. Run linters before committing

## 📝 License

Proprietary - All rights reserved

## 👥 Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Email: support@binarybonds.com
