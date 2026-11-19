# 🌐 Smart Supply Chain Management System
### *Enterprise Resource Planning (ERP) Platform with AI-Powered Demand Forecasting*

[![Node.js](https://img.shields.io/badge/Node.js-v22-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.139-009688.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC.svg)](https://tailwindcss.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D.svg)](https://redis.io/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.7-F7931E.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Executive Summary

**Smart Supply Chain Management System** is a full-stack, enterprise-grade supply chain and inventory management platform designed to solve core operational bottlenecks faced by distributors, suppliers, and warehouse operators. 

By decoupling high-throughput transactional business logic from an asynchronous Python machine learning microservice, the system delivers **real-time inventory control**, **role-based procurement workflows**, **proactive stockout risk alert automation**, and **multi-model predictive demand forecasting** ($R^2 = 0.9337$, $MAE = 13.25\text{ units}$) to prevent costly stock shortages and inventory overstocking.

---

## 🏢 Business Problem & Engineering Solution

### The Challenge
Small and medium-sized supply chain enterprises often suffer from:
1. **Stockouts & Overstocking:** Lack of predictive insight leads to either lost sales from depleted stock or cash tied up in excess storage.
2. **Data Inconsistency & Race Conditions:** Concurrent order placements frequently lead to overselling when inventory deductions are not handled atomically.
3. **Information Asymmetry:** Suppliers lack real-time visibility into order status, while administrators struggle to monitor inventory across diverse vendors.
4. **Slow API Response Times:** Repeated aggregation queries across large product catalogs degrade dashboard performance.

### The Solution
* **Microservices Architecture:** Node.js/Express powers the transactional REST API, while a Python/FastAPI microservice handles time-series machine learning inference.
* **Atomic Transactions:** Order creation and stock decrements are encapsulated in atomic database transactions (`prisma.$transaction`) to eliminate inventory discrepancies.
* **Event-Driven Asynchronous Processing:** BullMQ and Redis offload email dispatching and audit logging from the HTTP request-response cycle.
* **Real-Time Cross-Role Sync:** Socket.IO pushes live notifications and dashboard metric updates instantly without page refreshes.
* **Cache-Aside Pattern:** Redis caches catalog search and filter queries (300s TTL) with automated cache invalidation on write events.

---

## 🏗️ System Architecture

```
                                 ┌─────────────────────────┐
                                 │   React 19 Frontend     │
                                 │ (Tailwind CSS, Recharts)│
                                 └────────────┬────────────┘
                                              │ HTTP / WebSocket (Socket.IO)
                                              ▼
                                 ┌─────────────────────────┐
                                 │   Node.js / Express     │
                                 │    Main Backend API     │
                                 └──────┬─────┬─────┬──────┘
                                        │     │     │
            ┌───────────────────────────┘     │     └──────────────────────────┐
            ▼                                 ▼                                ▼
┌───────────────────────┐         ┌───────────────────────┐        ┌───────────────────────┐
│ PostgreSQL 16 (Prisma)│         │     Redis 7.x         │        │    Python FastAPI     │
│  - Users & Auth       │         │  - Cache-Aside Store  │        │   AI Microservice     │
│  - Products & Orders  │         │  - BullMQ Job Queue   │        │  - Lasso / Linear Reg │
│  - Audit Logs         │         └───────────────────────┘        │  - Multi-Model Bench  │
└───────────────────────┘                                          └───────────────────────┘
```

---

## 🚀 Key Engineering Highlights

### 1. Machine Learning Demand Forecasting Pipeline
* **No Target Leakage:** Features are strictly computed using information available up to month $t$, predicting next-month demand ($t+1$).
* **Time-Series Lag Features:** Formulated with Product Price, Stock Level, Current Month Orders, Lag-1 Orders ($t-1$), 3-Month Moving Average (`RollingMean3`), and Seasonal Month.
* **Chronological Train/Test Split:** Evaluated on unseen future time horizons (training on 2023–2024, testing on 2025).
* **Saved Transformation Pipeline:** Both model and feature scaler (`StandardScaler`) are versioned with `joblib` to ensure consistent real-world unit outputs.

### 2. Multi-Model Machine Learning Benchmarking
To identify the optimal regressor for time-series demand forecasting, 5 distinct machine learning models were systematically benchmarked on the identical chronological test split (Train: 2023–2024, Test: 2025 unseen future data):

| Model | $R^2$ Score | MAE (Units) | RMSE (Units) | MAPE (%) | Train Time | Inference Latency | Status |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Lasso Regression ($L_1$)** | **0.9337** | **13.25** | 18.70 | **7.12%** | 7.79 ms | 0.487 ms | 🏆 **Champion (Lowest MAE)** |
| **Ridge Regression ($L_2$)** | 0.9333 | 13.40 | 18.77 | 7.21% | 3.70 ms | 0.272 ms | Runner-up |
| **Gradient Boosting** | **0.9402** | 13.96 | **17.77** | 7.39% | 268.02 ms | 0.698 ms | Highest $R^2$ & Lowest RMSE |
| **Linear Regression (OLS)** | 0.9259 | 14.23 | 19.78 | 7.56% | 7.34 ms | 0.216 ms | Baseline |
| **Random Forest (100 trees)** | 0.9206 | 17.03 | 20.47 | 9.08% | 539.40 ms | 17.757 ms | High Variance / Latency |

*Key Takeaway:* Regularized linear models (Lasso and Ridge) effectively eliminate multicollinearity across temporal lags and achieve the lowest mean absolute error on unseen test horizons with sub-millisecond inference latency.

### 3. Proactive AI Stockout Alerts & Notification Automation
* **ML Shortage Detection on Order Placement:** Replaced static `stock < 10` rules with dynamic AI evaluations: whenever an order decrements inventory, the system queries the demand model to evaluate whether remaining stock covers projected monthly demand.
* **Dual Role Targeting:** When a critical stockout risk (`CRITICAL_SHORTAGE`) or potential shortage (`POTENTIAL_SHORTAGE`) is detected, in-app notifications and real-time Socket.IO alerts are routed to all Administrators AND the product-owning Supplier.
* **Intelligent Deduplication:** Prevents notification flood by checking for unread alerts for the same product within a 12-hour rolling window.
* **On-Demand Catalog Audits (`POST /api/forecast/check-alerts`):** Administrators can trigger platform-wide AI inventory audits on demand to evaluate the entire catalog and dispatch actionable restock recommendations.
* **Resilient Fallback:** Automatically reverts to static threshold monitoring if the Python AI microservice is temporarily unavailable.

### 4. End-to-End Microservice Gateway & Stock Risk Engine
* **Internal API Gateway:** The Node.js backend retrieves product pricing and historical 30-day order volume from PostgreSQL and securely proxies requests to the Python AI service via an internal HTTP client with timeout guards.
* **Automated Stock Risk Classification:**
  * `HEALTHY`: Available inventory meets or exceeds projected monthly demand.
  * `POTENTIAL_SHORTAGE`: Projected demand exceeds current stock.
  * `CRITICAL_SHORTAGE`: Current stock is under 50% of projected demand.
  * `OVERSTOCK_RISK`: Inventory exceeds 2.5x projected demand (holding cost alert).
* **Smart Restock Recommendation:** Calculates the exact reorder quantity needed to cover projected shortages plus a 20% safety stock buffer.
* **Fail-Safe Resilience:** If the Python microservice is temporarily offline, the Node.js backend handles the connection gracefully with `503 Service Unavailable` without crashing the core platform.

### 5. High-Integrity Order Processing
* Order placement and stock decrement operations execute inside atomic database transactions (`prisma.$transaction(async (tx) => { ... })`).
* If inventory is insufficient or a concurrent transaction claims the last units, the entire operation safely rolls back with `400 Insufficient Stock`.

### 6. Enterprise Security & Authorization
* **Dual-Token Authentication:** 15-minute JWT access tokens paired with 7-day refresh tokens stored in HTTP clients with automated transparent token rotation via Axios interceptors.
* **Role-Based Access Control (RBAC):** Granular middleware guards (`role('ADMIN', 'SUPPLIER')`) protecting routes at the HTTP layer.
* **Zero Secret Exposure:** User queries employ strict Prisma projections (`USER_SELECT`) to ensure bcrypt password hashes are never returned over the wire.
* **Hardened Transport:** Enforced HTTP headers via Helmet, rate limiting via `express-rate-limit`, and scoped CORS origins.

### 7. Background Jobs & Caching
* **BullMQ Event Queue:** Asynchronous workers handle event delivery, audit logging, and email triggers without holding the client connection.
* **Redis Cache-Aside:** High-frequency product searches and filtered queries are cached with automated invalidation when products are created, modified, or removed.

### 8. Interactive Frontend AI Dashboard
* **Predictive Visualizations (Recharts):** Visualizes available inventory side-by-side with projected monthly demand, confidence intervals, and recent order volume.
* **Real-Time Microservice Health Monitoring:** Live status banner indicating whether the Python FastAPI service is online with graceful degraded mode alerts.
* **Actionable Procurement Guidance:** Automatically computes reorder recommendations and shortage quantities with color-coded risk alerts.
* **Dual Role Portals:** Dedicated AI forecasting views accessible via `/admin/forecast` and `/supplier/forecast` with role-scoped data isolation.

---

## 👥 Role-Based Feature Matrix

| Capability | Administrator (`ADMIN`) | Supplier (`SUPPLIER`) |
|---|:---:|:---:|
| **Overall Analytics Dashboard** | Full platform revenue, volume, and stock charts | Scoped to own activity |
| **Product Management** | Create, view, edit, and delete all products | Create, view, edit own products |
| **Product Image CDN** | Cloudinary CDN upload & management | Cloudinary CDN upload & management |
| **Order Management** | View and audit all platform orders | Create orders, view own order history |
| **Real-Time Notifications** | Instant alerts on new orders & low stock warnings | Instant alerts on order status changes |
| **AI Demand Forecast** | View platform-wide demand forecasts & shortages | View projected demand for owned products |
| **Proactive Shortage Audits** | Trigger catalog-wide AI risk scans & alert dispatch | Scan owned inventory |
| **User Administration** | Full user management & status activation | Restricted |
| **Audit Log Trail** | Review timestamped actions & actor IDs | Restricted |

---

## 📡 REST API Reference

Interactive OpenAPI documentation is mounted at `http://localhost:5000/api-docs` (Node.js) and `http://localhost:8000/docs` (FastAPI).

| Method | Endpoint | Access | Description |
|---|---|:---:|---|
| **POST** | `/api/auth/register` | Public | Register new supplier account |
| **POST** | `/api/auth/login` | Public | User login, returns access & refresh tokens |
| **POST** | `/api/auth/refresh` | Public | Refresh expired access token using refresh token |
| **GET** | `/api/products` | `ADMIN`, `SUPPLIER` | Get paginated products (supports search, sort, filter, Redis cache) |
| **POST** | `/api/products` | `ADMIN`, `SUPPLIER` | Create new product with optional Cloudinary image upload |
| **GET** | `/api/products/:id` | `ADMIN`, `SUPPLIER` | Get product details by ID |
| **PUT** | `/api/products/:id` | `ADMIN`, `SUPPLIER` | Update product details and image (ownership enforced) |
| **DELETE** | `/api/products/:id` | `ADMIN` | Delete product and write audit log |
| **GET** | `/api/orders` | `ADMIN`, `SUPPLIER` | View orders (all for admin, user-scoped for supplier) |
| **POST** | `/api/orders` | `ADMIN`, `SUPPLIER` | Create order with atomic stock decrement & Socket.IO broadcast |
| **GET** | `/api/forecast/status` | `ADMIN`, `SUPPLIER` | Verify AI microservice connectivity and health |
| **GET** | `/api/forecast` | `ADMIN`, `SUPPLIER` | Batch demand forecasts & platform-wide stock shortage summary |
| **GET** | `/api/forecast/:productId`| `ADMIN`, `SUPPLIER` | Forecast next-month demand & evaluate inventory risk for product |
| **POST** | `/api/forecast/check-alerts` | `ADMIN`, `SUPPLIER` | Proactively scan catalog for stockout risks & dispatch automated alerts |
| **GET** | `/api/notifications` | `ADMIN`, `SUPPLIER` | Fetch user notification history |
| **PUT** | `/api/notifications/:id/read` | `ADMIN`, `SUPPLIER` | Mark single notification as read |
| **GET** | `/api/users` | `ADMIN` | List all system users (passwords omitted) |
| **POST** | `/api/users` | `ADMIN` | Create user with explicit role |

### Python FastAPI Microservice Endpoints (`:8000`)
| Method | Endpoint | Description |
|---|---|---|
| **GET** | `/health` | Microservice and model artifact health verification |
| **GET** | `/model-info` | Trained architecture, evaluation metrics, and feature metadata |
| **GET** | `/benchmark` | Multi-model comparative benchmark metrics (Lasso, Ridge, GBDT, RF) |
| **POST** | `/predict` | Pydantic-validated unit demand prediction with confidence intervals |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, JavaScript (ES6+), Tailwind CSS 4, React Router DOM 7, Recharts, React Hot Toast, Socket.IO Client, Axios |
| **Main Backend** | Node.js (v22), Express.js (v5), Prisma ORM, PostgreSQL 16, JWT, Bcrypt, Multer, Helmet, Morgan, Swagger |
| **AI / ML Service** | Python 3.12, FastAPI, Uvicorn, Scikit-learn, Pandas, NumPy, Joblib, Pydantic, HTTPX |
| **Caching & Queues** | Redis 7, BullMQ, ioredis |
| **Storage & Media** | Cloudinary (CDN Image Storage) |
| **DevOps & Tooling** | Docker, Docker Compose, Git, ESLint, Jest, Supertest |

---

## 📂 Repository Structure

```text
Smart-Supply-Chain/
├── ai-service/                   # Python FastAPI ML Microservice
│   ├── app/schemas/              # Pydantic request & response schemas
│   ├── data/                     # Cleaned time-series historical datasets
│   ├── models/                   # Saved ML models, scalers, and benchmark reports
│   ├── services/                 # Preprocessing, benchmark suite, training, inference
│   ├── tests/                    # Integration test suite for prediction endpoints
│   ├── main.py                   # FastAPI server entry point
│   └── requirements.txt          # Python dependencies
│
├── backend/                      # Node.js Express REST API
│   ├── src/
│   │   ├── config/               # Prisma, Redis, BullMQ, Swagger configurations
│   │   ├── controllers/          # Business logic handlers
│   │   ├── middleware/           # Auth, RBAC, caching, and error middlewares
│   │   ├── routes/               # API endpoint definitions
│   │   ├── services/             # AI gateway client, alert engine, audit, notifications
│   │   └── server.js             # HTTP server with Socket.IO attachment
│   ├── prisma/                   # PostgreSQL schema and migration scripts
│   ├── tests/                    # Automated integration and unit test suites
│   └── package.json              # Backend dependencies
│
├── frontend/                     # React 19 Single Page Application
│   ├── src/
│   │   ├── components/           # Reusable UI, layout, and chart components
│   │   │   └── forecast/         # RiskBadge, ForecastChart (Recharts visualization)
│   │   ├── context/              # Auth and Socket.IO React context providers
│   │   ├── pages/                # Admin & Supplier role-based views
│   │   │   └── ForecastDashboard.jsx # Full-featured AI demand forecasting portal
│   │   ├── routes/               # Role-based protected routes
│   │   └── services/             # Axios API client (auth, product, order, forecast)
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite bundler configuration
│
├── docs/                         # Internal architectural notes and specs
├── docker-compose.yml            # Local container configuration (Redis)
└── README.md                     # Project documentation
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
* **Node.js:** v20+ (v22 recommended)
* **Python:** 3.10+ (3.12 recommended)
* **PostgreSQL:** 15+ running on port `5432`
* **Redis:** 7+ running on port `6379`

---

### 1. Database Setup
```sql
CREATE DATABASE supply_chain_db;
```

---

### 2. Main Backend Setup (Node.js)
```powershell
cd backend
npm install

# Copy environment template
cp .env.example .env
# Configure your DATABASE_URL, JWT_SECRET, AI_SERVICE_URL, and Cloudinary keys in backend/.env

# Apply Prisma migrations
npx prisma migrate dev

# Run automated tests (29 tests across 5 suites)
npm test

# Start the development server
npm run dev
```
* Backend runs at: `http://localhost:5000`
* Swagger Interactive API Docs: `http://localhost:5000/api-docs`

---

### 3. AI Service Setup (Python FastAPI)
```powershell
cd ../ai-service

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run model benchmarking suite (optional)
python services/benchmark_models.py

# Run automated tests (7 integration tests)
python tests/test_prediction_api.py

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```
* FastAPI runs at: `http://localhost:8000`
* Interactive API Documentation (Swagger): `http://localhost:8000/docs`

---

### 4. Frontend Setup (React 19)
```powershell
cd ../frontend
npm install

# Start the Vite development server
npm run dev
```
* Frontend runs at: `http://localhost:5173`

---

## 🧪 Testing & Verification

* **Backend Unit & Integration Tests (29 Passing Tests):**
  ```powershell
  cd backend
  npm test
  ```
  *Suites executed:*
  * `forecastAlerts.test.js`: AI shortage risk evaluation, multi-recipient alert dispatch, notification deduplication, and offline fallback.
  * `forecastApi.test.js`: Forecast authorization, supplier isolation, stock shortage calculation, batch summaries, and 503 failover handling.
  * `productApi.test.js`: Product CRUD, pagination, price filtering, sorting, and Redis cache-aside.
  * `authMiddleware.test.js`: Bearer token extraction, invalid token rejection, expired token handling.
  * `productValidator.test.js`: Zod schema validation rules.

* **AI Service Prediction Tests (7 Passing Tests):**
  ```powershell
  cd ai-service
  .\venv\Scripts\python.exe tests/test_prediction_api.py
  ```
  *Verifies health check, model info metrics, multi-model benchmark rankings, valid demand forecasting, and Pydantic validation error handling.*

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
