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

## API Security Checklist

- Unauthenticated requests to `/products`, `/orders`, and `/users` return `401` with `No token` or `Unauthorized`.
- Supplier requests can read and create products and orders, but cannot access user management or admin-only destructive routes.
- Admin requests can access `/users`, `/products`, and `/orders` with the expected CRUD permissions.
- Supplier order reads are scoped to `req.user.id` so one supplier cannot see another supplier's orders.
- Expired access tokens are refreshed transparently for protected API calls, while `/auth/login`, `/auth/register`, and `/auth/refresh` are not forced into the refresh flow.
- Registering users always creates supplier accounts; admin-created users hash passwords before persistence and only accept `ADMIN` or `SUPPLIER` roles.
