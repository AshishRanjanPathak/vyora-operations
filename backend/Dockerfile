# ===================================================
# Multi-Stage Production Dockerfile for Backend API
# ===================================================

FROM node:20-alpine AS base

# Install OpenSSL and build utilities for native binaries (Prisma & Bcrypt)
RUN apk add --no-cache openssl libc6-compat python3 make g++

WORKDIR /app

# Copy package definitions and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma Client engine
RUN npm ci --omit=dev
RUN npx prisma generate

# Copy application source code
COPY . .

# Expose backend REST API port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Healthcheck to verify service availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

# Start the enterprise server
CMD ["node", "src/server.js"]