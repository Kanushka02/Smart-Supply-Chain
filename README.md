# Smart Supply Chain System

## 📌 Description
An AI-powered supply chain management system for suppliers to manage inventory, orders, and predict demand.

## 🚀 Features
- User authentication
- Product & inventory management
- Order tracking
- AI demand prediction

## 🏗️ Tech Stack
- Frontend: React
- Backend: Node.js (Express)
- AI Service: Python (FastAPI)
- Database: PostgreSQL
- DevOps: Docker, GitHub Actions

## 📅 Status
Day 01 - Project setup completed

## Day 26 - Background Jobs with BullMQ

### What was implemented
- Order creation now responds immediately after saving the order and enqueues background processing.
- Background worker processes order jobs using BullMQ + Redis.
- Worker performs low-stock checks and writes notification/audit logs.
- Order email sending runs in the worker with retry support (3 attempts, exponential backoff).

### Backend setup
1. Install backend dependencies:
	- cd backend
	- npm install
2. Ensure Redis is running on 127.0.0.1:6379 or set REDIS_URL.
3. Start the API:
	- npm run dev
4. Start the worker in another terminal:
	- npm run worker

### Environment variables used
- REDIS_URL (optional, example: redis://127.0.0.1:6379)
- REDIS_HOST (optional, default: 127.0.0.1)
- REDIS_PORT (optional, default: 6379)
- LOW_STOCK_THRESHOLD (optional, default: 10)
- ORDER_WORKER_CONCURRENCY (optional, default: 5)

## API Security Checklist

- Unauthenticated requests to `/products`, `/orders`, and `/users` return `401` with `No token` or `Unauthorized`.
- Supplier requests can read and create products and orders, but cannot access user management or admin-only destructive routes.
- Admin requests can access `/users`, `/products`, and `/orders` with the expected CRUD permissions.
- Supplier order reads are scoped to `req.user.id` so one supplier cannot see another supplier's orders.
- Expired access tokens are refreshed transparently for protected API calls, while `/auth/login`, `/auth/register`, and `/auth/refresh` are not forced into the refresh flow.
- Registering users always creates supplier accounts; admin-created users hash passwords before persistence and only accept `ADMIN` or `SUPPLIER` roles.
