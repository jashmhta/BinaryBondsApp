# BinaryBonds - Bond Portfolio Management Platform

> A comprehensive, production-ready bond portfolio management platform for Indian markets, built with modern technologies and best practices.

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Backend Tests](https://github.com/yourusername/BinaryBondsApp/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/yourusername/BinaryBondsApp/actions)
[![Python](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React Native](https://img.shields.io/badge/react--native-0.79-blue.svg)](https://reactnative.dev/)
[![MongoDB](https://img.shields.io/badge/mongodb-5.0+-green.svg)](https://www.mongodb.com/)

## 🌟 Features

### Portfolio Management
- ✅ **Multi-Bond Support**: G-Sec, Corporate Bonds, SDL, Tax-Free Bonds
- ✅ **Real-time Portfolio Tracking**: Live valuation with P&L calculations
- ✅ **Interest Accrual**: Automated interest calculation based on coupon rates
- ✅ **Maturity Calendar**: Track upcoming maturities with alerts
- ✅ **Transaction History**: Complete audit trail of all buy/sell transactions

### Analytics & Reporting
- 📊 **Dashboard Analytics**: Portfolio summary with key metrics
- 📈 **Growth Charts**: 6-month historical portfolio visualization
- 📄 **PDF Reports**: Professional portfolio summaries
- 📅 **Maturity Alerts**: Notifications for bonds maturing within 30 days

### User Experience
- 🎨 **Dark/Light Mode**: Elegant themes with gold accents
- 🔔 **Smart Notifications**: Interest payouts, maturity alerts, rating changes
- 🔐 **Security**: JWT auth + 4-digit PIN protection
- 📱 **Cross-Platform**: iOS, Android, and Web support

## 🏗️ Architecture

**Complete modular architecture with clean separation of concerns**

### Tech Stack

**Frontend:**
- React Native 0.79 + Expo 54
- TypeScript 5.8 (strict mode)
- Expo Router (file-based navigation)
- Zustand (state management)
- Service layer for API calls

**Backend:**
- FastAPI 0.110 (Python 3.10+)
- Modular architecture (API, Services, Models, Database)
- Motor (Async MongoDB driver)
- Pydantic (data validation)
- JWT authentication
- pytest test suite

**Database:**
- MongoDB 5.0+
- Optimized indexes
- Connection pooling

See [Complete Documentation](README.md) for architecture details.

## 🚀 Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set SECRET_KEY
python -m backend.app
```

### Frontend

```bash
cd frontend
yarn install
yarn start
```

See [Backend README](backend/README.md) for detailed setup.

## 🧪 Testing

```bash
cd backend
pytest --cov=backend
```

## 📚 Documentation

- [Backend API Docs](backend/README.md)
- [API Reference](http://localhost:8001/docs)
- [Architecture Guide](README.md)

## 🔒 Security

All critical security issues resolved:
- ✅ Environment-based SECRET_KEY
- ✅ CORS whitelist configuration
- ✅ JWT 7-day expiration
- ✅ bcrypt password hashing
- ✅ Input validation

## 📝 License

Proprietary © 2025 BinaryBonds
