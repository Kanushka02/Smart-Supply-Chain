# =============================================================================
# Production Dockerfile for Node.js Backend API
# =============================================================================
FROM node:22-slim

# Set working directory
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Copy package manifests and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma Client
RUN npm ci --no-audit
RUN npx prisma generate

# Copy backend source code
COPY src ./src
COPY server.js ./

# Expose API port
EXPOSE 5000

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Start backend server
CMD ["node", "server.js"]
