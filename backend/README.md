# Chandra Naturals — Production-Ready Backend

Production-grade e-commerce REST API backend for **Chandra Naturals**, handcrafted for authentic, small-batch traditional pantry delicacies, A2 bilona ghee, sprouted porridge mixes, and heritage formulations.

Built with **Node.js, Express.js (ES Modules), MongoDB Atlas (Mongoose), JWT with Refresh Token Rotation, Razorpay Payments, and MSG91 SMS / Nodemailer Email Notifications**.

---

## 🛠️ Technology Stack

- **Runtime & Framework**: Node.js v18+ (ES Modules `import/export`), Express.js 4.x
- **Database & ODM**: MongoDB Atlas / local MongoDB with Mongoose 8.x
- **Authentication**: JWT access tokens (15m expiry) + HttpOnly secure cookie refresh tokens (7d expiry) with rotation and reuse detection
- **Password Security**: `bcryptjs` salted hashing (work factor 12)
- **Payments**: Razorpay Node SDK, HMAC-SHA256 signature verification (`crypto.timingSafeEqual`), idempotent webhook handling
- **Notifications**: MSG91 Flow API for transactional SMS in India, Nodemailer SMTP for HTML order confirmation & OTP emails
- **Security & Hardening**: `helmet`, strict `cors` whitelist, `express-rate-limit` (DDoS & brute-force defense)
- **Data Validation**: `express-validator`

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection manager with auto-retry
│   │   └── constants.js          # Business rules, roles, and status enums
│   ├── controllers/
│   │   ├── authController.js     # Register, OTP verify, login, refresh, logout
│   │   ├── productController.js  # Catalog browsing, filtering, search, and admin CRUD
│   │   ├── cartController.js     # User cart sync and server-side pricing
│   │   ├── addressController.js  # Shipping address book with PIN validation
│   │   ├── orderController.js    # Order placement, pricing engine, atomic stock reservation
│   │   ├── paymentController.js  # Razorpay orders, HMAC verification, webhooks
│   │   ├── adminController.js    # Dashboard analytics and order lifecycle
│   │   ├── reviewController.js   # Verified purchaser reviews and ratings
│   │   └── couponController.js   # Promo code validation & discounts
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization (admin/customer)
│   │   ├── errorHandler.js       # Centralized error handler with standardized JSON output
│   │   └── rateLimiter.js        # Tiered rate limiters (general API, auth, OTP)
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt hooks
│   │   ├── OTPVerification.js    # Hashed OTPs with TTL auto-cleanup and attempt limits
│   │   ├── RefreshToken.js       # Hashed session tokens with reuse detection
│   │   ├── Category.js           # Categories (thokku, health-mix, ghee, masalas, skin-hair)
│   │   ├── Product.js            # Rich product catalog with text search indexes
│   │   ├── Cart.js               # Customer shopping cart
│   │   ├── Address.js            # 6-digit PIN & 10-digit phone validated addresses
│   │   ├── Order.js              # Orders with immutable historical snapshots
│   │   ├── Payment.js            # Razorpay payment records & webhook audit log
│   │   ├── Coupon.js             # Discount rules, limits, and expiration
│   │   ├── Review.js             # Customer reviews with rating recalculation hook
│   │   └── Wishlist.js           # Customer favorites
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── productRoutes.js      # /api/products/*
│   │   ├── cartRoutes.js         # /api/cart/*
│   │   ├── addressRoutes.js      # /api/addresses/*
│   │   ├── orderRoutes.js        # /api/orders/*
│   │   ├── paymentRoutes.js      # /api/payment/*
│   │   ├── couponRoutes.js       # /api/coupons/*
│   │   ├── reviewRoutes.js       # /api/products/:productId/reviews
│   │   └── adminRoutes.js        # /api/admin/*
│   ├── seeds/
│   │   ├── seedData.js           # 20+ authentic products and categories
│   │   └── seedDatabase.js       # Database migration script
│   ├── services/
│   │   ├── authService.js        # Token generation, cookie setters, token rotation
│   │   ├── orderService.js       # Server-side pricing & atomic stock reservation
│   │   ├── razorpayService.js    # Razorpay SDK integration & signature math
│   │   └── notificationService.js# MSG91 SMS & Nodemailer email dispatch
│   ├── utils/
│   │   └── apiResponse.js        # Standardized API response formatters
│   ├── app.js                    # Express application setup
│   └── server.js                 # Server entrypoint with graceful shutdown
├── tests/
│   └── test-flows.js             # 40-step comprehensive automated test suite
├── .env.example                  # Environment configuration template
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/chandra_naturals`) or a free [MongoDB Atlas Cluster](https://www.mongodb.com/atlas)

### 2. Installation
Navigate into the `backend/` directory and install dependencies:
```bash
cd backend
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your configuration:
```ini
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/chandra_naturals
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Seed Database
Populate the database with all 20 authentic products, categories, and the initial administrator account:
```bash
npm run seed
```
Default Super Admin Credentials:
- **Email**: `admin@chandranaturals.com`
- **Password**: `AdminPass@Chandra2026`

### 5. Run Server
Start the server in watch mode:
```bash
npm run dev
```
Health Check: `http://localhost:5000/api/health`

### 6. Run Automated Tests
Execute the full test suite verifying all 40 security, auth, and order flows:
```bash
npm test
```

---

## 🔒 Security Architecture Highlights

1. **Zero-Trust Pricing**:
   - The frontend never submits or calculates order prices or totals.
   - The backend looks up products directly in MongoDB, multiplies quantities, applies verified coupon rules, adds standard delivery (₹99 for orders under ₹3000, free above ₹3000), and computes the exact total on the server.
2. **Atomic Stock Management**:
   - Uses MongoDB's atomic `$inc: { stock: -quantity }` with `{ stock: { $gte: quantity } }` to eliminate race conditions and prevent overselling.
   - Automatically rolls back and restores stock if payment fails or an order is cancelled.
3. **Cryptographic Payment Verification**:
   - Verifies Razorpay signatures using HMAC-SHA256 (`crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')`).
   - Uses `crypto.timingSafeEqual` to eliminate timing attacks.
4. **Hashed OTP Storage**:
   - OTP codes are NEVER stored in plain text.
   - Hashed using SHA-256 before saving to MongoDB, with short TTL auto-expiry (10 mins) and maximum 5-attempt brute-force protection.
5. **Token Rotation & Reuse Detection**:
   - Refresh tokens are stored hashed in database.
   - If an old/revoked refresh token is replayed, the system detects potential session theft and revokes all active sessions for that user.

---

## 📡 API Reference Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register customer & dispatch OTP | No (Rate Limited) |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit OTP & activate session | No (Rate Limited) |
| `POST` | `/api/auth/resend-otp` | Resend verification code (60s cooldown) | No (Rate Limited) |
| `POST` | `/api/auth/login` | Sign in with email/mobile & password | No (Rate Limited) |
| `POST` | `/api/auth/refresh` | Refresh access token using HttpOnly cookie | No (Cookie) |
| `POST` | `/api/auth/logout` | Revoke session & clear cookie | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Bearer Token |
| `POST` | `/api/auth/forgot-password` | Request password reset OTP | No (Rate Limited) |
| `POST` | `/api/auth/reset-password` | Reset password using verified OTP | No (Rate Limited) |

### Products & Categories (`/api/products`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/products` | Browse products (page, limit, category, search, sort, isVeg) | Public |
| `GET` | `/api/products/:id` | Get single product by ID or slug | Public |
| `GET` | `/api/products/slug/:slug` | Get single product by slug | Public |
| `GET` | `/api/products/categories` | List all active product categories | Public |
| `GET` | `/api/products/:id/reviews` | View verified customer reviews | Public |
| `POST` | `/api/products/:id/reviews` | Submit verified purchase review | Customer |

### Cart & Address Book
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/cart` | View customer cart with server totals | Customer |
| `POST` | `/api/cart` | Add product to cart (validates stock) | Customer |
| `PUT` | `/api/cart/:itemId` | Update quantity | Customer |
| `DELETE` | `/api/cart/:itemId` | Remove item | Customer |
| `DELETE` | `/api/cart` | Clear entire cart | Customer |
| `GET` | `/api/addresses` | List saved shipping addresses | Customer |
| `POST` | `/api/addresses` | Add new address (validates 6-digit PIN) | Customer |
| `PUT` | `/api/addresses/:id` | Update address | Customer |
| `DELETE` | `/api/addresses/:id` | Delete address | Customer |

### Orders & Payments (`/api/orders`, `/api/payment`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/orders` | Create order & reserve stock | Customer |
| `GET` | `/api/orders` | Customer order history | Customer |
| `GET` | `/api/orders/:id` | Single order details | Customer |
| `POST` | `/api/orders/:id/cancel` | Cancel order & restore stock | Customer |
| `POST` | `/api/payment/create-order` | Initiate Razorpay order with server total | Customer |
| `POST` | `/api/payment/verify` | Verify HMAC payment signature | Customer |
| `POST` | `/api/payment/webhook` | Idempotent Razorpay webhook listener | Webhook Signature |

### Admin Dashboard & Management (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Key performance metrics & sales charts | Admin Only |
| `GET` | `/api/admin/orders` | Filter, search, and list all orders | Admin Only |
| `GET` | `/api/admin/orders/:id` | Detailed order inspection | Admin Only |
| `PUT` | `/api/admin/orders/:id/status` | Update fulfillment & tracking info | Admin Only |
| `POST` | `/api/admin/products` | Add new product | Admin Only |
| `PUT` | `/api/admin/products/:id` | Edit product attributes | Admin Only |
| `DELETE` | `/api/admin/products/:id` | Soft-deactivate product | Admin Only |
| `PATCH` | `/api/admin/products/:id/stock`| Adjust inventory stock | Admin Only |
