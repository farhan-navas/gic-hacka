# syntax=docker/dockerfile:1

# Base image
FROM node:20-alpine AS base
WORKDIR /app

# ----------------------
# Install dependencies
# ----------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --only=production

# ----------------------
# Build the app
# ----------------------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ----------------------
# Production image
# ----------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

ENV PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000
USER nextjs

CMD ["node", "server.js"]
