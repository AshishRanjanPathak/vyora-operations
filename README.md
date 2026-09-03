# 🏢 Full-Stack Mini ERP + CRM Operations Portal

> **A Production-Grade, Role-Based Enterprise Operations System** built with **JavaScript (Node.js & React)**, **Prisma ORM**, **Neon Serverless PostgreSQL**, **Express.js**, and **Tailwind CSS**, strictly engineered following **SOLID Software Design Principles**.

[![Database: Neon](https://img.shields.io/badge/Database-Neon_PostgreSQL-00E599?style=flat-square&logo=postgresql)](https://neon.tech)
[![ORM: Prisma](https://img.shields.io/badge/ORM-Prisma_5.22-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![Backend: Express](https://img.shields.io/badge/Backend-Express_ES_Modules-black?style=flat-square&logo=express)](https://expressjs.com)
[![Frontend: React](https://img.shields.io/badge/Frontend-React_18_+_Vite-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Styling: TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS_3-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Code: Strict JavaScript](https://img.shields.io/badge/Language-100%25_JavaScript-F7DF1E?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Architecture: SOLID](https://img.shields.io/badge/Architecture-SOLID_Clean_Code-purple?style=flat-square)](https://en.wikipedia.org/wiki/SOLID)

---

## 📑 Table of Contents

1. [Executive Overview & Business Value](#-executive-overview--business-value)
2. [System Architecture & Data Flow](#-system-architecture--data-flow)
3. [Domain Models & Relational Schema](#-domain-models--relational-schema)
4. [Core Business Domains](#-core-business-domains)
5. [Role-Permission Access Matrix (RBAC)](#-role-permission-access-matrix-rbac)
6. [SOLID Principles in Action](#-solid-principles-in-action)
7. [API Contract & Postman Collection](#-api-contract--postman-collection)
8. [Local Development Quickstart](#-local-development-quickstart)
9. [Automated Verification & E2E Test Suite](#-automated-verification--e2e-test-suite)
10. [Cloud Deployment Architecture](#-cloud-deployment-architecture)
11. [Senior Full-Stack Engineer Interview Guide](#-senior-full-stack-engineer-interview-guide)

---

## 🌟 Executive Overview & Business Value

In high-volume wholesale distribution and supply chain operations, manual invoicing and disconnected spreadsheets lead to inventory discrepancies, overselling, lost sales leads, and order fulfillment delays.

This **Mini ERP + CRM Portal** solves these challenges by providing a unified, real-time operating system with:
- **Zero Overselling**: Sales Challan confirmations run inside atomic database transactions (`prisma.$transaction`) that verify real-time stock levels, decrement quantities, and write immutable audit movement records simultaneously.
- **Historical Financial Integrity**: Line items on delivery challans permanently snapshot product name, SKU, and unit price at creation time, ensuring future price changes never corrupt past financial records.
- **Role-Gated Operational Security**: Role-based access control guards (RBAC) at both backend HTTP middleware and frontend React Router wrappers prevent unauthorized data mutations.

---

## 🏗 System Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            REACT 18 FRONTEND (Vite)                         │
│  ┌───────────────────────────┬───────────────────────────────────────────┐  │
│  │  Dashboard & Stats        │  Customers CRM & Interaction Timeline     │  │
│  ├───────────────────────────┼───────────────────────────────────────────┤  │
│  │  Product Catalog & Alerts │  Warehouse Inventory & Stock Logs         │  │
│  ├───────────────────────────┴───────────────────────────────────────────┤  │
│  │  Multi-Product Sales Challan Wizard & Printable Dispatch Invoices     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                      ▲                                   ▲                  │
│             Axios Interceptor (Auto Bearer Token & 401 Redirect)            │
└──────────────────────┼───────────────────────────────────┼──────────────────┘
                       │ HTTP / REST                       │
┌──────────────────────▼───────────────────────────────────▼──────────────────┐
│                         NODE.JS / EXPRESS BACKEND API                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Security Middlewares: Helmet, Dynamic CORS, Morgan, Error Boundary  │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  Guards: JWT Authentication Guard & Role-Based Authorization Guard    │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  Controllers (DIP): Input parsing & HTTP presentation                 │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  Services (SRP & DIP): Atomic transactions & domain logic execution   │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │  Repositories: Prisma query encapsulation & decoupled storage         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Prisma Client 5.22
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                   NEON SERVERLESS POSTGRESQL DATABASE                       │
│  ┌───────────────┬───────────────────┬───────────────────┬───────────────┐  │
│  │  users        │  customers        │  customer_notes   │  products     │  │
│  ├───────────────┼───────────────────┼───────────────────┼───────────────┤  │
│  │  stock_moves  │  challans (Enum)  │  challan_items    │  Audit Indexes│  │
│  └───────────────┴───────────────────┴───────────────────┴───────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄 Domain Models & Relational Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  SALES
  WAREHOUSE
  ACCOUNTS
}

enum CustomerType {
  RETAIL
  WHOLESALE
  DISTRIBUTOR
}

enum CustomerStatus {
  LEAD
  ACTIVE
  INACTIVE
}

enum MovementType {
  IN
  OUT
}

enum ChallanStatus {
  DRAFT
  CONFIRMED
  CANCELLED
}

model User {
  id               String             @id @default(uuid())
  name             String
  email            String             @unique
  password         String
  role             Role               @default(SALES)
  isActive         Boolean            @default(true)
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt
  createdCustomers Customer[]         @relation("CreatedCustomers")
  followUps        CustomerFollowUp[] @relation("CreatedFollowUps")
  stockMovements   StockMovement[]    @relation("CreatedMovements")
  challans         Challan[]          @relation("CreatedChallans")

  @@map("users")
}

model Customer {
  id           String             @id @default(uuid())
  name         String
  mobile       String
  email        String?
  businessName String
  gstNumber    String?
  address      String?
  customerType CustomerType       @default(WHOLESALE)
  status       CustomerStatus     @default(LEAD)
  notes        String?
  createdById  String
  createdBy    User               @relation("CreatedCustomers", fields: [createdById], references: [id])
  followUps    CustomerFollowUp[]
  challans     Challan[]
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  @@map("customers")
}

model CustomerFollowUp {
  id           String    @id @default(uuid())
  customerId   String
  customer     Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  note         String
  followUpDate DateTime?
  createdById  String
  createdBy    User      @relation("CreatedFollowUps", fields: [createdById], references: [id])
  createdAt    DateTime  @default(now())

  @@map("customer_follow_ups")
}

model Product {
  id                String          @id @default(uuid())
  name              String
  sku               String          @unique
  category          String
  unitPrice         Decimal         @db.Decimal(10, 2)
  currentStock      Int             @default(0)
  minimumStock      Int             @default(5)
  warehouseLocation String?
  stockMovements    StockMovement[]
  challanItems      ChallanItem[]
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@map("products")
}

model StockMovement {
  id          String       @id @default(uuid())
  productId   String
  product     Product      @relation(fields: [productId], references: [id])
  quantity    Int
  type        MovementType
  reason      String
  createdById String
  createdBy   User         @relation("CreatedMovements", fields: [createdById], references: [id])
  createdAt   DateTime     @default(now())

  @@map("stock_movements")
}

model Challan {
  id            String        @id @default(uuid())
  challanNumber String        @unique
  customerId    String
  customer      Customer      @relation(fields: [customerId], references: [id])
  totalQuantity Int
  status        ChallanStatus @default(DRAFT)
  createdById   String
  createdBy     User          @relation("CreatedChallans", fields: [createdById], references: [id])
  items         ChallanItem[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@map("challans")
}

model ChallanItem {
  id          String   @id @default(uuid())
  challanId   String
  challan     Challan  @relation(fields: [challanId], references: [id], onDelete: Cascade)
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  productName String
  sku         String
  unitPrice   Decimal  @db.Decimal(10, 2)
  quantity    Int

  @@map("challan_items")
}
```

---

## 🚀 Core Business Domains

### 1. Customers CRM & Lead Pipeline
- Full CRUD operations with multi-field search (`name`, `businessName`, `phone`, `email`).
- Filter leads by status (`LEAD`, `ACTIVE`, `INACTIVE`) and tier (`WHOLESALE`, `DISTRIBUTOR`, `RETAIL`).
- Interactive activity timeline for logging calls, discount agreements, and scheduled follow-ups.

### 2. Products Catalog & Reorder Health
- Product tracking with unique SKU validation and categories.
- Real-time `isLowStock` dynamic flag computed when `currentStock <= minimumStock`.
- Referential integrity protection: Products cannot be deleted if referenced in previous challans or stock movements (HTTP 409 Conflict).

### 3. Inventory & Warehouse Movements
- Immutable audit log of stock inflows (`IN`) and outflows (`OUT`).
- Negative stock prevention: Outflow adjustments are strictly rejected if requested quantity exceeds available stock.

### 4. Sales Challan Workflow & Financial Snapshots
- **Auto Numbering**: Sequential format `CH-YYYY-0001` auto-generated on creation.
- **Snapshot Pricing**: Line items capture permanent values for `unitPrice`, `sku`, and `productName` so historical orders never change when product catalog prices are updated.
- **State Transition Machine**:
  - `DRAFT`: Order captured, zero stock modifications.
  - `CONFIRMED`: Runs inside `prisma.$transaction` -> locks stock, verifies availability, decrements inventory, creates `OUT` stock movement, transitions status to `CONFIRMED`.
  - `CANCELLED`: If cancelling a confirmed challan, runs inside `prisma.$transaction` to restore inventory and log an `IN` return movement.

---

## 🔐 Role-Permission Access Matrix (RBAC)

| Resource / Action | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **View Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **View Customers** | ✅ | ✅ | ❌ | ❌ |
| **Create / Edit Customers** | ✅ | ✅ | ❌ | ❌ |
| **Delete Customer** | ✅ | ❌ | ❌ | ❌ |
| **Log CRM Follow-ups** | ✅ | ✅ | ❌ | ❌ |
| **View Products Catalog** | ✅ | ✅ | ✅ | ✅ |
| **Create / Edit Products** | ✅ | ❌ | ✅ | ❌ |
| **Delete Product** | ✅ | ❌ | ❌ | ❌ |
| **View Stock Movements** | ✅ | ❌ | ✅ | ❌ |
| **Manual Stock Inflow/Outflow** | ✅ | ❌ | ✅ | ❌ |
| **View Sales Challans** | ✅ | ✅ | ✅ | ✅ |
| **Create Draft Challan** | ✅ | ✅ | ❌ | ❌ |
| **Confirm / Cancel Challan** | ✅ | ❌ | ✅ | ❌ |

---

## 💎 SOLID Principles in Action

| Principle | Implementation in this Codebase |
| :--- | :--- |
| **Single Responsibility (SRP)** | Every class handles a distinct layer: `Repositories` handle database I/O, `Services` execute pure business logic and transactions, `Controllers` handle HTTP request/response serialization, and `Validators` handle Zod schemas. |
| **Open/Closed (OCP)** | Custom error hierarchy (`AppError`, `NotFoundError`, `UnauthorizedError`, `ConflictError`) extends the base class without modifying the centralized error handling middleware. |
| **Liskov Substitution (LSP)** | All error classes can be thrown interchangeably and handled correctly with appropriate HTTP status codes and JSON formatting. |
| **Interface Segregation (ISP)** | Granular repository methods (`findByEmail`, `findLowStockProducts`, `updateStock`) allow services to consume only what they require without coupling to monolithic query blobs. |
| **Dependency Inversion (DIP)** | All services and controllers use **Constructor Injection** with default fallback parameters: `constructor(repo = defaultRepo) { this.repo = repo; }`. This decouples business logic from Prisma directly and enables easy unit test mocking. |

---

## 📦 API Contract & Postman Collection

The project includes an exportable Postman collection located at:
📁 `backend/minierp_postman_collection.json`

### Key Endpoints:
```http
POST   /api/auth/login               # Authenticate & issue JWT
GET    /api/auth/me                  # Get current authenticated user profile
GET    /api/dashboard/stats          # Real-time metrics overview
GET    /api/customers                # Paginated & filtered customer list
POST   /api/customers                # Create customer
GET    /api/customers/:id            # Customer profile + follow-up timeline
POST   /api/customers/:id/followups  # Log CRM note
GET    /api/products                 # Catalog list with lowStock filter
POST   /api/products                 # Create product
PUT    /api/products/:id             # Update product
DELETE /api/products/:id             # Delete product (ADMIN only)
GET    /api/stock/movements          # View audit logs
POST   /api/stock/movements          # Record manual stock adjustment
GET    /api/challans                 # Filterable challans list
POST   /api/challans                 # Create DRAFT challan
GET    /api/challans/:id             # View printable delivery note
POST   /api/challans/:id/confirm     # Confirm dispatch (Atomic transaction)
POST   /api/challans/:id/cancel      # Cancel challan (Restore stock)
```

---

## 💻 Local Development Quickstart

### 🐳 1-Command Docker Quickstart (Automated Full-Stack)

Run the entire PostgreSQL database, Express API, and Nginx React frontend in a single command:

```bash
docker compose up --build
```
- **Web App**: `http://localhost:5173` (or `http://localhost:80`)
- **Backend API**: `http://localhost:5000`
- **PostgreSQL 16**: `localhost:5432`

---

### 💻 Manual Local Development Quickstart

### Prerequisites:
- **Node.js**: v18+ or v20+
- **Git**

### Step 1: Clone & Install
```powershell
git clone <your-repo-url> minierp
cd minierp
```

### Step 2: Backend Setup
```powershell
cd backend
npm install
npx prisma generate
node prisma/seed.js
npm run dev
```
*Backend runs on `http://localhost:5000`*.

### Step 3: Frontend Setup
Open a second terminal:
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*.

### 🔑 Demo Accounts (Password for all: `password123`)

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **Admin** | `admin@minierp.com` | Full master access |
| **Sales** | `sales@minierp.com` | CRM leads, follow-ups, draft challans |
| **Warehouse**| `warehouse@minierp.com` | Product stock, physical movements, dispatch confirmation |
| **Accounts** | `accounts@minierp.com` | Read-only view for audit & dashboard |

---

## 🧪 Automated Verification & E2E Test Suite

Run the full-stack automated E2E integration test suite:
```powershell
cd backend
npm run test:e2e
```

**Verifies:**
1. Multi-role authentication & JWT validation
2. CRM lead creation & search
3. Follow-up interaction timeline
4. Product catalog creation
5. Draft challan creation (Stock unchanged check)
6. Warehouse delivery confirmation (Atomic stock decrement check)
7. Real-time dashboard calculation
8. Warehouse manual stock inflow adjustment
9. Negative stock prevention (Oversized challan rejection with HTTP 400)
10. Role-based route guard enforcement (Accounts blocked from mutating)

---

## ☁️ Cloud Deployment Architecture

```text
┌───────────────────────┐      ┌─────────────────────────┐      ┌──────────────────────┐
│        VERCEL         │      │         RENDER          │      │         NEON         │
│   React 18 + Vite     │─────▶│    Node / Express API   │─────▶│ Serverless Postgres  │
│ (Custom Vercel.json)  │      │      (render.yaml)      │      │  (Connection Pooler) │
└───────────────────────┘      └─────────────────────────┘      └──────────────────────┘
```

### 1. Database (Neon PostgreSQL)
1. Create a database on [Neon.tech](https://neon.tech).
2. Copy the pooled connection string into `DATABASE_URL`.

### 2. Backend on Render
1. Connect repository on [Render.com](https://render.com).
2. Select Root Directory: `backend`.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm start`
5. Add Environment Variables:
   - `DATABASE_URL`: *Your Neon connection string*
   - `JWT_SECRET`: *A secure random string*
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`

### 3. Frontend on Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Select Root Directory: `frontend`.
3. Set Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
4. Deploy!

---

## 🎯 Senior Full-Stack Engineer Interview Guide

### Q1: How do you prevent race conditions when multiple warehouse workers confirm sales challans simultaneously?
> **Answer**: We wrap the stock verification, stock decrement, and stock movement log inside a single atomic database transaction using `prisma.$transaction`. Under PostgreSQL's transactional isolation, the row is evaluated and locked during the update. If available stock is insufficient at the moment of commit, the entire transaction rolls back, throwing an `AppError(400)` and guaranteeing inventory never drops below zero.

### Q2: Why capture snapshots on `ChallanItem` instead of referencing `Product.unitPrice` via foreign keys?
> **Answer**: In B2B wholesale systems, product catalog prices fluctuate over time. If a challan item only stored `productId` and joined against `products` to calculate order totals, updating a product's price today would retroactively alter the financial totals of challans generated months ago. By snapshotting `productName`, `sku`, and `unitPrice` on `ChallanItem` at creation, we maintain complete financial and legal auditability.

### Q3: How did you apply the Dependency Inversion Principle (DIP) in JavaScript without TypeScript interfaces?
> **Answer**: We used **Constructor Dependency Injection**. Every Service and Controller accepts its dependencies as constructor parameters with sensible production defaults (e.g. `constructor(customerRepo = defaultCustomerRepo) { this.customerRepo = customerRepo; }`). This allows passing mock repositories in unit tests without monkey-patching globals or coupling business logic to Prisma directly.

### Q4: How are routes secured on both Frontend and Backend?
> **Answer**:
> - **Backend**: We use two independent middleware layers: `authenticate.js` (which verifies the JWT Bearer signature and injects `req.user`) and `authorize.js(...roles)` (which enforces role access and aborts with HTTP 403 Forbidden).
> - **Frontend**: We wrap private routes with `<ProtectedRoute allowedRoles={[...]} />`. If unauthenticated, it redirects to `/login`. If unauthorized for that specific screen, it redirects to `/unauthorized`.

---

## 📄 License
MIT License. Built for enterprise production standards and technical excellence.