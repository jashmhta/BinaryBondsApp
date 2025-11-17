# BinaryBonds Architecture Documentation

## Overview

BinaryBonds is built with a **modern, modular, production-ready architecture** following industry best practices.

## Architecture Principles

1. **Separation of Concerns**: Clear boundaries between layers
2. **Dependency Injection**: Services injected at runtime
3. **Single Responsibility**: Each module has one clear purpose
4. **SOLID Principles**: Object-oriented design patterns
5. **DRY**: Don't repeat yourself - shared services and utilities
6. **Security First**: Environment-based configuration, no hardcoded secrets

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React Native)                │
│  ┌───────────┐  ┌──────────┐  ┌────────────────────┐   │
│  │  Screens  │→│ Contexts │→│ Service Layer (API)│   │
│  └───────────┘  └──────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        ↓ HTTP/REST (JSON)
┌─────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                     │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌─────────┐  │
│  │  Routes  │→│ Services │→│ Models  │→│Database │  │
│  └──────────┘  └──────────┘  └─────────┘  └─────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓ Motor (Async)
┌─────────────────────────────────────────────────────────┐
│                   MongoDB (NoSQL)                       │
│     users | bonds | user_bonds | transactions | ...    │
└─────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Layer Breakdown

#### 1. API Layer (`backend/api/`)

**Responsibility**: HTTP request/response handling

- **Routes**: RESTful endpoint definitions
  - `auth.py`: Authentication endpoints
  - `dashboard.py`: Dashboard data
  - `portfolio.py`: Portfolio management
  - `transactions.py`: Transaction handling
  - `reports.py`: Report generation
  - `notifications.py`: Notification management
  - `user.py`: User preferences

- **Dependencies**: Shared dependencies (auth, database)
  - JWT token validation
  - Database connection injection

#### 2. Services Layer (`backend/services/`)

**Responsibility**: Business logic implementation

- **AuthService**: User authentication, password management, JWT tokens
- **PortfolioService**: Portfolio calculations, P&L, interest accrual
- **TransactionService**: Transaction creation, holdings updates
- **ReportService**: PDF generation, report formatting
- **NotificationService**: Notification CRUD operations
- **SeedService**: Sample data generation

**Key Design Patterns:**
- Dependency Injection (database passed to constructor)
- Single Responsibility (one service per domain)
- Static methods for pure calculations

#### 3. Models Layer (`backend/models/`)

**Responsibility**: Data validation and serialization

Uses **Pydantic** for:
- Request validation
- Response serialization
- Type safety
- Automatic documentation

Models:
- `user.py`: User registration, login, response
- `bond.py`: Bond data structure
- `transaction.py`: Transaction CRUD
- `notification.py`: Notification structure
- `auth.py`: JWT tokens, PIN
- `dashboard.py`: Dashboard statistics
- `portfolio.py`: User bond holdings

#### 4. Database Layer (`backend/database/`)

**Responsibility**: Database connection and initialization

- **Connection Management**:
  - Singleton pattern for database client
  - Connection pooling (10-50 connections)
  - Graceful shutdown

- **Index Management**:
  - Automatic index creation on startup
  - Optimized queries
  - Unique constraints

#### 5. Configuration (`backend/config.py`)

**Responsibility**: Centralized configuration

Uses **Pydantic Settings** for:
- Environment variable parsing
- Type validation
- Default values
- Required field enforcement

Configuration sections:
- API settings (name, version, prefix)
- Security (JWT, CORS)
- Database (MongoDB URL, name)
- Server (host, port, workers)
- Rate limiting
- Optional integrations (AWS, Email)

### Request Flow

```
1. HTTP Request → FastAPI
2. API Route → Validates input (Pydantic)
3. Dependencies → Injects DB, validates JWT
4. Service Layer → Executes business logic
5. Database → Performs async operations
6. Service Layer → Calculates/transforms data
7. API Route → Serializes response (Pydantic)
8. HTTP Response → Returns JSON
```

Example: Get Portfolio

```python
# 1. Route receives request
@router.get("/portfolio/list")
async def get_portfolio(
    current_user: dict = Depends(get_current_user),  # 2. Inject auth
    db: Database = Depends(get_db)                   # 2. Inject DB
):
    # 3. Create service
    portfolio_service = PortfolioService(db)

    # 4. Execute business logic
    portfolio = await portfolio_service.get_user_portfolio(
        current_user["_id"]
    )

    # 5. Return (automatically serialized by Pydantic)
    return portfolio
```

## Frontend Architecture

### Layer Breakdown

#### 1. Screens (`frontend/app/`)

**File-based routing** with Expo Router:

```
app/
├── (tabs)/              # Bottom tab navigation
│   ├── _layout.tsx      # Tab bar config
│   ├── index.tsx        # Dashboard
│   ├── portfolio.tsx    # Portfolio list
│   ├── transactions.tsx # Transactions
│   ├── reports.tsx      # Reports
│   └── profile.tsx      # User profile
├── bond/
│   └── [id].tsx         # Dynamic bond detail
├── _layout.tsx          # Root layout (providers)
├── index.tsx            # Splash/routing
├── login.tsx            # Login screen
└── register.tsx         # Register screen
```

#### 2. Contexts (`frontend/contexts/`)

**Global state management**:

- **AuthContext**: User authentication state
  - User object
  - Token management
  - Login/logout functions
  - Auto token injection

- **ThemeContext**: App theming
  - Dark/light mode toggle
  - Color schemes
  - Persistent storage

#### 3. Service Layer (`frontend/services/`)

**API abstraction layer**:

- **apiService**: Centralized HTTP client
  - Axios instance
  - Auto token injection
  - Response/error interceptors
  - Type-safe methods

- **authService**: Authentication operations
- **portfolioService**: Portfolio & dashboard data
- **transactionService**: Transaction management
- **notificationService**: Notification handling

**Benefits:**
- DRY: No duplicate API calls
- Type Safety: TypeScript interfaces
- Error Handling: Centralized error management
- Testing: Easy to mock services

#### 4. Component Flow

```
Screen Component
    ↓ (uses)
Context (Auth/Theme)
    ↓ (uses)
Service Layer
    ↓ (calls)
API Service
    ↓ (HTTP)
Backend API
```

Example: Dashboard Screen

```typescript
// 1. Screen uses hooks
const { theme } = useTheme();
const { user } = useAuth();

// 2. Fetches data via service
const summary = await portfolioService.getDashboardSummary();

// 3. Service calls API
// (services/portfolioService.ts)
async getDashboardSummary() {
  return apiService.get<DashboardSummary>('/api/dashboard/summary');
}

// 4. API service handles HTTP
// (services/api.ts)
async get<T>(url: string) {
  const response = await this.client.get<T>(url);
  return response.data;
}
```

## Database Schema

### Collections

#### users
```javascript
{
  _id: UUID,
  email: EmailStr (unique),
  password_hash: string,
  name: string,
  phone: string?,
  pin_hash: string?,
  created_at: datetime,
  preferences: {
    theme: "dark" | "light",
    notifications_enabled: boolean
  }
}
```

**Indexes:**
- `email` (unique)

#### bonds
```javascript
{
  _id: UUID,
  isin: string (unique),
  name: string,
  bond_type: "G-Sec" | "Corporate" | "SDL" | "Tax-Free",
  issuer: string,
  face_value: number,
  coupon_rate: number,
  maturity_date: date,
  ratings: {...},
  interest_frequency: string,
  is_secured: boolean,
  category: string,
  yield_to_maturity: number,
  description: string
}
```

**Indexes:**
- `isin` (unique)
- `bond_type`
- `issuer`

#### user_bonds
```javascript
{
  _id: UUID,
  user_id: UUID,
  bond_id: UUID,
  quantity: number,
  purchase_date: date,
  purchase_price: number,
  invested_amount: number
}
```

**Indexes:**
- `user_id`
- `bond_id`
- `(user_id, bond_id)` (compound, unique)

#### transactions
```javascript
{
  _id: UUID,
  user_id: UUID,
  bond_id: UUID,
  bond_name: string,
  isin: string,
  transaction_type: "Buy" | "Sell",
  quantity: number,
  price: number,
  total_amount: number,
  gst_amount: number,
  date: date,
  contract_note: string?
}
```

**Indexes:**
- `user_id`
- `(user_id, date)` (compound)
- `date`

#### notifications
```javascript
{
  _id: UUID,
  user_id: UUID,
  type: "interest_payout" | "maturity_alert" | "rating_change",
  title: string,
  message: string,
  date: datetime,
  is_read: boolean
}
```

**Indexes:**
- `user_id`
- `(user_id, date)` (compound)
- `is_read`

## Security Architecture

### Authentication Flow

```
1. User submits credentials
2. Backend validates (bcrypt comparison)
3. JWT token generated (7-day expiry)
4. Token stored in AsyncStorage
5. Axios interceptor adds to all requests
6. Backend validates token (JWT decode)
7. User object injected into route handler
```

### Security Layers

1. **Transport**: HTTPS (in production)
2. **Authentication**: JWT tokens
3. **Authorization**: User-specific data queries
4. **Password Storage**: bcrypt hashing
5. **PIN Protection**: Additional security layer
6. **Input Validation**: Pydantic models
7. **CORS**: Whitelist-based
8. **Rate Limiting**: API throttling

## Performance Optimization

### Backend

1. **Async Operations**: All I/O is non-blocking
2. **Connection Pooling**: MongoDB pool (10-50)
3. **Database Indexes**: Optimized queries
4. **Lazy Loading**: Data fetched on demand
5. **Caching Ready**: Redis integration points

### Frontend

1. **Code Splitting**: Expo Router lazy loads screens
2. **Optimized Renders**: React.memo, useMemo
3. **Asset Optimization**: Image caching
4. **Bundle Size**: Tree shaking, minification

### Database

1. **Compound Indexes**: Multi-field queries optimized
2. **Projection**: Fetch only required fields
3. **Aggregation**: Server-side data processing
4. **Connection Reuse**: Pooled connections

## Testing Strategy

### Backend Tests

- **Unit Tests**: Service layer calculations
- **Integration Tests**: API endpoint testing
- **Database Tests**: Repository operations
- **Auth Tests**: JWT validation, password hashing

### Frontend Tests (To Add)

- **Unit Tests**: Service layer mocking
- **Component Tests**: Screen rendering
- **E2E Tests**: User flow testing

## Deployment Architecture

```
┌──────────────────┐
│   Load Balancer  │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│ API  │  │ API  │  (Multiple instances)
│ Pod  │  │ Pod  │
└───┬──┘  └──┬───┘
    │        │
    └────┬───┘
         │
    ┌────▼─────┐
    │ MongoDB  │  (Replica Set)
    │ Cluster  │
    └──────────┘
```

## Scalability Considerations

### Horizontal Scaling

- **Backend**: Stateless FastAPI instances
- **Database**: MongoDB replica sets
- **Cache**: Redis for session/data caching

### Vertical Scaling

- **Connection Pool**: Increase pool size
- **Worker Processes**: More Uvicorn workers
- **Database**: Larger MongoDB instances

## Future Enhancements

1. **Caching Layer**: Redis for frequently accessed data
2. **Message Queue**: Celery for async tasks
3. **Microservices**: Split into domain services
4. **GraphQL**: Alternative to REST
5. **WebSockets**: Real-time updates
6. **CDN**: Static asset delivery

## Conclusion

BinaryBonds architecture is designed for:
- ✅ **Maintainability**: Clear module boundaries
- ✅ **Scalability**: Horizontal and vertical scaling
- ✅ **Security**: Multiple security layers
- ✅ **Performance**: Async operations, optimized queries
- ✅ **Testability**: Dependency injection, mocking
- ✅ **Production-Ready**: Best practices throughout
