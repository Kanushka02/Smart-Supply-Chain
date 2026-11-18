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

By decoupling high-throughput business logic from an asynchronous Python machine learning microservice, the system provides **real-time inventory control**, **role-based procurement workflows**, and **predictive demand forecasting** ($R^2 = 0.9259$, $MAE = 14.23\text{ units}$) to prevent costly stock shortages and inventory overstocking.

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
│  - Products & Orders  │         │  - BullMQ Job Queue   │        │  - Linear Regression  │
│  - Audit Logs         │         └───────────────────────┘        │  - Feature Scaler     │
└───────────────────────┘                                          └───────────────────────┘
```

---

## 🚀 Key Engineering Highlights

### 1. Machine Learning Demand Forecasting Pipeline
* **No Target Leakage:** Features are strictly computed using information available up to month $t$, predicting next-month demand ($t+1$).
* **Time-Series Lag Features:** Formulated with Product Price, Stock Level, Current Month Orders, Lag-1 Orders ($t-1$), 3-Month Moving Average (`RollingMean3`), and Seasonal Month.
* **Chronological Train/Test Split:** Evaluated on unseen future time horizons (training on 2023–2024, testing on 2025).
* **Saved Transformation Pipeline:** Both model and feature scaler (`StandardScaler`) are versioned with `joblib` to ensure consistent real-world unit outputs.

| Metric | Score | Business Interpretation |
|---|---|---|
| **Mean Absolute Error (MAE)** | **14.23 units** | Forecast is off by an average of only ~14 units on batches of 100–350 units |
| **Root Mean Squared Error (RMSE)** | **19.78 units** | Strong resistance to large outlier errors |
| **Coefficient of Determination ($R^2$)** | **0.9259** | Explains 92.6% of demand variance on unseen future data |
| **Mean Absolute Percentage Error (MAPE)** | **7.56%** | Low relative forecast deviation across all product categories |

### 2. High-Integrity Order Processing
* Order placement and stock decrement operations execute inside atomic database transactions (`prisma.$transaction(async (tx) => { ... })`).
* If inventory is insufficient or a concurrent transaction claims the last units, the entire operation safely rolls back with `400 Insufficient Stock`.

### 3. Enterprise Security & Authorization
* **Dual-Token Authentication:** 15-minute JWT access tokens paired with 7-day refresh tokens stored in HTTP clients with automated transparent token rotation via Axios interceptors.
* **Role-Based Access Control (RBAC):** Granular middleware guards (`role('ADMIN', 'SUPPLIER')`) protecting routes at the HTTP layer.
* **Zero Secret Exposure:** User queries employ strict Prisma projections (`USER_SELECT`) to ensure bcrypt password hashes are never returned over the wire.
* **Hardened Transport:** Enforced HTTP headers via Helmet, rate limiting via `express-rate-limit`, and scoped CORS origins.

### 4. Background Jobs & Caching
* **BullMQ Event Queue:** Asynchronous workers handle event delivery, audit logging, and email triggers without holding the client connection.
* **Redis Cache-Aside:** High-frequency product searches and filtered queries are cached with automated invalidation when products are created, modified, or removed.

---

## 👥 Role-Based Feature Matrix

| Capability | Administrator (`ADMIN`) | Supplier (`SUPPLIER`) |
|---|:---:|:---:|
| **Overall Analytics Dashboard** | Full platform revenue, volume, and stock charts | Scoped to own activity |
| **Product Management** | Create, view, edit, and delete all products | Create, view, edit own products |
| **Product Image CDN** | Cloudinary CDN upload & management | Cloudinary CDN upload & management |
| **Order Management** | View and audit all platform orders | Create orders, view own order history |
| **Real-Time Notifications** | Instant alerts on new orders & low stock warnings | Instant alerts on order status changes |
| **AI Demand Forecast** | View platform-wide product demand projections | View projected demand for owned products |
| **User Administration** | Full user management & status activation | Restricted |
| **Audit Log Trail** | Review timestamped actions & actor IDs | Restricted |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, JavaScript (ES6+), Tailwind CSS 4, React Router DOM 7, Recharts, React Hot Toast, Socket.IO Client, Axios |
| **Main Backend** | Node.js (v22), Express.js (v5), Prisma ORM, PostgreSQL 16, JWT, Bcrypt, Multer, Helmet, Morgan, Swagger |
| **AI / ML Service** | Python 3.12, FastAPI, Uvicorn, Scikit-learn, Pandas, NumPy, Joblib, Pydantic |
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
│   ├── models/                   # Saved ML models, scalers, and metadata
│   ├── services/                 # Preprocessing, training, and inference logic
│   ├── tests/                    # Integration test suite for prediction endpoints
│   ├── main.py                   # FastAPI server entry point
│   └── requirements.txt          # Python dependencies
│
├── backend/                      # Node.js Express REST API
│   ├── prisma/                   # Database schema & migrations
│   ├── src/
│   │   ├── config/               # Prisma, Redis, Cloudinary, Swagger configs
│   │   ├── controllers/          # HTTP request handlers (auth, product, order, user)
│   │   ├── middleware/           # Auth, RBAC, caching, upload, error handlers
│   │   ├── routes/               # Express endpoint definitions
│   │   ├── services/             # Audit, notification, and email domain services
│   │   └── validators/           # Zod schema validation
│   ├── tests/                    # Jest integration and unit test suites
│   ├── workers/                  # BullMQ background job workers
│   ├── package.json              # Backend dependencies
│   └── server.js                 # HTTP + Socket.IO server entry point
│
├── frontend/                     # React 19 Single Page Application
│   ├── src/
│   │   ├── components/           # Reusable UI, layout, chart, and modal components
│   │   ├── context/              # Auth and Socket.IO React context providers
│   │   ├── pages/                # Admin & Supplier role-based views
│   │   ├── routes/               # Role-based protected routes
│   │   └── services/             # Axios API client with auto-refresh interceptors
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
* **Node.js** (v18+) and **npm**
* **Python** (v3.10+)
* **PostgreSQL** (v14+) running on `localhost:5432`
* **Redis** (v6+) running on `localhost:6379` (or run via Docker: `docker compose up -d`)

---

### 1. Database Setup (PostgreSQL)
Create a database named `supply_chain_db` in PostgreSQL:
```sql
CREATE DATABASE supply_chain_db;
```

---

### 2. Backend Setup (Node.js)
```powershell
cd backend
npm install

# Copy environment template
cp .env.example .env
# Configure your DATABASE_URL, JWT_SECRET, and Cloudinary keys in backend/.env

# Apply Prisma migrations
npx prisma migrate dev

# Run automated tests
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

# Train the model & generate artifacts (if not already trained)
python services/train_model.py

# Run prediction test suite
python tests/test_prediction_api.py

# Start the FastAPI microservice
uvicorn main:app --reload --port 8000
```
* AI Service runs at: `http://localhost:8000`
* Swagger Interactive Docs: `http://localhost:8000/docs`

---

### 4. Frontend Setup (React + Vite)
```powershell
cd ../frontend
npm install

# Start Vite dev server
npm run dev
```
* Frontend runs at: `http://localhost:5173`

---

## 🧪 Testing & Verification

* **Backend Unit & Integration Tests:**
  ```powershell
  cd backend
  npm test
  ```
  *Coverage includes Product API CRUD, JWT middleware authentication, and Zod input validation.*

* **AI Service Prediction Tests:**
  ```powershell
  cd ai-service
  .\venv\Scripts\python.exe tests/test_prediction_api.py
  ```
  *Verifies health check, model info metrics, valid demand forecasting, and Pydantic validation error handling.*

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
