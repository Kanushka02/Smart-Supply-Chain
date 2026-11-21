# =============================================================================
# Production Dockerfile for Node.js Backend API
# =============================================================================
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install OpenSSL and libc dependencies for Prisma on Alpine Linux
RUN apk add --no-cache openssl libc6-compat

# Copy package manifests, Prisma config, and schema
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client for Alpine Linux
RUN npx prisma generate

# Copy backend source code and background workers
COPY src ./src
COPY workers ./workers
COPY server.js ./

# Expose API port
EXPOSE 5000

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Start backend server
CMD ["node", "server.js"]
