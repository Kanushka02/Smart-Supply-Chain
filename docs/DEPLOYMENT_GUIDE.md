# ☁️ Production Cloud Architecture & Deployment Guide
### *Smart Supply Chain Management System*

This document provides a comprehensive, production-grade guide for deploying, configuring, scaling, and monitoring the **Smart Supply Chain Management System** across modern cloud infrastructures.

---

## 1. High-Level Production Architecture

In a production environment, the monolithic single-server model is replaced with decoupled, horizontally scalable cloud services connected via an internal Virtual Private Cloud (VPC):

```
                     ┌─────────────────────────────────────────────────────────┐
                     │                       User Traffic                      │
                     └────────────────────────────┬────────────────────────────┘
                                                  │ HTTPS (Port 443)
                                                  ▼
                     ┌─────────────────────────────────────────────────────────┐
                     │              DNS & CDN / Edge (Route 53)                │
                     └─────────────┬─────────────────────────────┬─────────────┘
                                   │                             │
             Static Assets / SPA   │                             │ Dynamic REST & WS API
                                   ▼                             ▼
                     ┌───────────────────────────┐ ┌───────────────────────────┐
                     │ CloudFront / S3 (Frontend)│ │ Application Load Balancer │
                     │   React 19 + Tailwind     │ │     (AWS ALB / Nginx)     │
                     └───────────────────────────┘ └─────────────┬─────────────┘
                                                                 │
                                                                 │ Target Group Routing
                                   ┌─────────────────────────────┴─────────────────────────────┐
                                   │ Internal VPC Private Subnet                               │
                                   │                                                           │
                                   │   ┌───────────────────────────┐ ┌─────────────────────┐   │
                                   │   │  Node.js Backend Tasks    │ │  Python AI Service  │   │
                                   │   │  (AWS ECS / Fargate)      │ │  (AWS ECS / Fargate)│   │
                                   │   │   - Express REST API      │ │   - FastAPI Server  │   │
                                   │   │   - Socket.IO Server      │ │   - Scikit-learn ML │   │
                                   │   │   - BullMQ Worker         │ └──────────┬──────────┘   │
                                   │   └─────────────┬─────────────┘            │              │
                                   │                 │ Internal HTTP Proxy      │              │
                                   │                 └──────────────────────────┘              │
                                   │                               │                           │
                                   │   ┌───────────────────────────┴───────────────────────┐   │
                                   │   │ Managed Data Layer                                │   │
                                   │   │  - AWS RDS PostgreSQL 16 (Multi-AZ with Read Rep) │   │
                                   │   │  - AWS ElastiCache for Redis 7 (Cluster Mode)     │   │
                                   │   │  - Cloudinary CDN (Product Image Storage)         │   │
                                   │   └───────────────────────────────────────────────────┘   │
                                   └───────────────────────────────────────────────────────────┘
```

---

## 2. Deployment Strategies

### Option A: Modern Cloud PaaS (Recommended for Portfolio & Fast Demos)
*Platforms:* **Render**, **Railway**, or **DigitalOcean App Platform**  
*Best for:* Zero-DevOps maintenance, automated SSL, continuous Git deployments, low monthly cost ($15–$30/mo).

#### 1. Database & Cache Provisioning
1. Provision a **Managed PostgreSQL 16** database instance.
   * Note the internal database URL: `postgresql://user:pass@host:5432/supply_chain_db?sslmode=require`.
2. Provision a **Managed Redis 7** instance.
   * Note the internal Redis URL: `rediss://user:pass@host:6379`.

#### 2. Python AI Microservice Deployment (`ai-service`)
* **Environment:** Docker or Python 3.12 Native.
* **Root Directory:** `ai-service`
* **Build Command:** `pip install -r requirements.txt`
* **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
* **Health Check Path:** `/health`
* **Environment Variables:**
  ```env
  PYTHONUNBUFFERED=1
  PORT=8000
  ```

#### 3. Main Backend Deployment (`backend`)
* **Environment:** Docker or Node.js 22 Native.
* **Root Directory:** `backend`
* **Build Command:** `npm ci && npx prisma generate`
* **Pre-Deploy Command:** `npx prisma migrate deploy` *(Runs automatically before traffic switches)*
* **Start Command:** `node server.js`
* **Environment Variables:**
  ```env
  NODE_ENV=production
  PORT=5000
  DATABASE_URL=postgresql://...
  REDIS_URL=rediss://...
  AI_SERVICE_URL=https://your-ai-service.onrender.com
  JWT_SECRET=generate_a_64_char_crypto_random_key
  JWT_REFRESH_SECRET=generate_a_different_64_char_crypto_key
  FRONTEND_URL=https://your-frontend.onrender.com
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  ```

#### 4. Frontend Deployment (`frontend`)
* **Environment:** Static Site (Vercel, Netlify, or Render Static).
* **Root Directory:** `frontend`
* **Build Command:** `npm install && npm run build`
* **Publish Directory:** `dist`
* **Rewrite Rules:** Rewrites all routes (`/*`) to `/index.html` for client-side React Router DOM routing.
* **Environment Variables:**
  ```env
  VITE_API_URL=https://your-backend.onrender.com/api
  VITE_SOCKET_URL=https://your-backend.onrender.com
  ```

---

### Option B: AWS Enterprise Production (ECS Fargate + RDS + ElastiCache)
*Best for:* Large enterprise production, SOC-2 compliance, high-availability multi-region scaling.

| Layer | AWS Service | Configuration |
|---|---|---|
| **Frontend CDN** | AWS S3 + CloudFront | S3 bucket hosting Vite `dist/` with global Edge Caching, TLS 1.3, and custom domain ACM SSL certificate. |
| **API Load Balancing**| AWS Application Load Balancer (ALB) | Public ALB with path-based routing: `/api/*` and `/socket.io/*` routed to Node.js ECS tasks; `/ai/*` routed to Python ECS tasks. |
| **Containers** | AWS ECS on AWS Fargate | Serverless container execution with auto-scaling based on CPU (>70%) and Memory (>75%) metrics. |
| **Database** | AWS RDS PostgreSQL 16 | Multi-AZ deployment with automatic failover, automated nightly snapshots, and encrypted EBS storage (AES-256). |
| **Caching & Queues** | AWS ElastiCache Redis 7 | Multi-node cluster with in-transit and at-rest encryption enabled. |
| **Secrets Management**| AWS Secrets Manager | Database credentials and JWT secrets stored in Secrets Manager and securely injected into ECS task definitions at launch. |

---

### Option C: Self-Hosted VPS with Docker Compose & Nginx (Low-Cost Production)
*Platforms:* **DigitalOcean Droplet ($12/mo)**, **Hetzner Cloud (€6/mo)**, or **AWS EC2 t4g.medium**  
*Best for:* Full infrastructure control, low cost, matching local development environment identically.

#### Production Server Nginx Configuration (`/etc/nginx/sites-available/supply-chain`)
```nginx
server {
    listen 80;
    server_name supply-chain.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name supply-chain.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/supply-chain.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/supply-chain.yourdomain.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend (React 19 Single Page Application)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API Gateway
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Support (Socket.IO)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 3. Environment Variables & Secret Hygiene

> [!CAUTION]
> Never commit actual production passwords, encryption secrets, or API tokens to source control. Always inject them at runtime via cloud secret managers or server environment variables.

### Environment Audit Matrix

| Variable | Target Service | Purpose | Recommended Production Setting |
|---|---|---|---|
| `NODE_ENV` | `backend` | Runtime optimization | `production` |
| `PORT` | `backend` | Service bind port | `5000` |
| `DATABASE_URL` | `backend` | PostgreSQL connection pool | Pooled connection with SSL (`sslmode=require`) |
| `REDIS_URL` | `backend` | Cache & event queue connection | In-VPC endpoint or TLS-enabled connection (`rediss://`) |
| `AI_SERVICE_URL` | `backend` | Internal ML gateway target | Private DNS or internal VPC address (`http://ai-service:8000`) |
| `JWT_SECRET` | `backend` | Access token signature | 64+ character cryptographically random string |
| `JWT_REFRESH_SECRET` | `backend` | Refresh token signature | Distinct 64+ character cryptographically random string |
| `FRONTEND_URL` | `backend` | CORS origin whitelisting | Strict production domain (e.g. `https://supply-chain.domain.com`) |
| `CLOUDINARY_*` | `backend` | Media CDN credentials | Production bucket API keys |
| `VITE_API_URL` | `frontend` | Axios REST client base | Public domain API path (e.g. `https://supply-chain.domain.com/api`) |
| `VITE_SOCKET_URL` | `frontend` | Socket.IO client base | Public domain root (e.g. `https://supply-chain.domain.com`) |

---

## 4. Database Migrations & Zero-Downtime Releases

To guarantee zero downtime and prevent service interruptions during production upgrades:

### 1. The Migration Pipeline
Always run migrations as a **pre-deployment release step** before replacing container instances:
```bash
# Executed by CI/CD runner before swapping traffic
npx prisma migrate deploy
```

### 2. Backward-Compatible Database Changes
When modifying the database schema:
* **Adding columns:** Always provide a `@default(...)` or make the column optional (`Nullable`). This ensures older running backend instances continue to function while new instances roll out.
* **Removing columns:** Use a two-phase rollout:
  1. Remove the column from the application code and deploy.
  2. In the subsequent deployment, drop the column from the Prisma schema and run migrations.

### 3. Automated Backup Routine
Automate daily PostgreSQL backups using `cron` and stream to AWS S3:
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="/tmp/backup_${TIMESTAMP}.sql.gz"

pg_dump -h $DB_HOST -U $DB_USER -d supply_chain_db | gzip > $BACKUP_FILE
aws s3 cp $BACKUP_FILE s3://supply-chain-backups/database/
rm $BACKUP_FILE
```

---

## 5. Horizontal Scaling & High Availability

### Scaling the Backend (Node.js & WebSockets)
* **Stateless REST Layer:** Express servers are stateless; sessions are maintained via JWTs rather than in-memory cookies.
* **WebSocket Clustering:** When running multiple Node.js backend instances behind a load balancer, attach `@socket.io/redis-adapter` so Socket.IO events published by Instance A are transparently relayed through Redis Pub/Sub to clients connected to Instance B.

### Scaling the AI Service (Python FastAPI)
* **Inference Worker Scaling:** Increase Uvicorn workers per container instance to utilize multiple CPU cores:
  ```bash
  uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
  ```
* **Stateless Model Serving:** Scikit-learn models and scalers are loaded into memory on server boot (`@app.on_event("startup")`), enabling near-instant response times (<1ms) without runtime disk I/O.

---

## 6. Observability, Logging & Sentry Monitoring

1. **Error Tracking (Sentry):**
   * Integrate `@sentry/node` into Express error handling middleware to capture production exceptions with stack traces, request context, and user roles.
2. **Container Health Monitoring:**
   * Both Node.js and FastAPI services expose unauthenticated health endpoints (`/api/test` and `/health`) configured in container orchestration health checks with a 10s interval and 3 retries.
3. **Structured Logging:**
   * Use Morgan combined with Winston for JSON-structured stdout logs, ingested seamlessly by AWS CloudWatch, Datadog, or Grafana Loki.
