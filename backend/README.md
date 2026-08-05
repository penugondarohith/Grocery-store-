# GroceryMart Backend API

Production-ready Node.js + Express.js + TypeScript + Prisma + Supabase PostgreSQL backend.

## 🗂 Folder Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Prisma ORM schema (all 22 tables)
├── src/
│   ├── config/
│   │   ├── env.ts             # Zod-validated env vars
│   │   ├── database.ts        # Prisma client singleton
│   │   ├── logger.ts          # Winston logger
│   │   └── swagger.ts         # OpenAPI/Swagger config
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   └── controllers.ts     # Category, Order, Payment
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT verify + DB check
│   │   ├── rbac.middleware.ts       # Role-based access control
│   │   ├── validate.middleware.ts   # Zod request validation
│   │   ├── rateLimiter.middleware.ts
│   │   └── error.middleware.ts      # Centralised error handler
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── routes.ts          # Products, Categories, Orders, Payments
│   ├── schemas/
│   │   └── index.ts           # All Zod validation schemas
│   ├── services/
│   │   ├── auth.service.ts    # Register, login, refresh, reset
│   │   ├── product.service.ts # CRUD + filter + search
│   │   ├── order.service.ts   # Full order lifecycle
│   │   └── payment.service.ts # Razorpay + COD + refund
│   ├── types/
│   │   └── index.ts           # AuthRequest, ApiResponse, pagination
│   ├── utils/
│   │   ├── jwt.utils.ts       # Sign/verify JWT tokens
│   │   ├── password.utils.ts  # bcrypt hash/compare
│   │   ├── response.utils.ts  # sendSuccess, sendCreated, pagination
│   │   └── errors.ts          # AppError, NotFoundError, etc.
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Entry point + graceful shutdown
├── .env.example
├── package.json
└── tsconfig.json
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Copy and fill env
cp .env.example .env
# Fill in DATABASE_URL, JWT secrets, etc.

# 3. Generate Prisma client
npm run prisma:generate

# 4. Push schema to Supabase
npm run prisma:push

# 5. Start dev server
npm run dev
# → http://localhost:5000
# → Swagger: http://localhost:5000/api/v1/docs
```

## 📡 API Endpoints

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | `/api/v1/auth/register` | ❌ | — |
| POST | `/api/v1/auth/login` | ❌ | — |
| POST | `/api/v1/auth/logout` | ❌ | — |
| POST | `/api/v1/auth/refresh` | ❌ | — |
| POST | `/api/v1/auth/forgot-password` | ❌ | — |
| POST | `/api/v1/auth/reset-password` | ❌ | — |
| GET | `/api/v1/auth/me` | ✅ | Any |
| GET | `/api/v1/products` | ❌ | — |
| GET | `/api/v1/products/:id` | ❌ | — |
| POST | `/api/v1/products` | ✅ | Admin |
| PUT | `/api/v1/products/:id` | ✅ | Admin |
| DELETE | `/api/v1/products/:id` | ✅ | Admin |
| GET | `/api/v1/categories` | ❌ | — |
| POST | `/api/v1/categories` | ✅ | Admin |
| PUT | `/api/v1/categories/:id` | ✅ | Admin |
| DELETE | `/api/v1/categories/:id` | ✅ | Admin |
| POST | `/api/v1/orders` | ✅ | Customer |
| GET | `/api/v1/orders` | ✅ | Customer |
| GET | `/api/v1/orders/:id` | ✅ | Any |
| PATCH | `/api/v1/orders/:id/status` | ✅ | Admin |
| DELETE | `/api/v1/orders/:id` | ✅ | Customer |
| POST | `/api/v1/payments/create` | ✅ | Customer |
| POST | `/api/v1/payments/verify` | ✅ | Customer |
| POST | `/api/v1/payments/refund/:orderId` | ✅ | Admin |

## 🔐 Security Features

- **JWT Access Tokens** (15 min) + **Refresh Token Rotation** (7 days)
- **bcrypt** password hashing (rounds: 12)
- **Rate limiting**: 100 req/15min global, 10 req/15min auth, 5 req/min payments
- **Helmet** security headers
- **CORS** with allowlist
- **Zod** validation on all request bodies, params, and query strings
- **RBAC**: customer / admin / super_admin

## 📖 Swagger Docs

Visit `http://localhost:5000/api/v1/docs` after starting the server.
