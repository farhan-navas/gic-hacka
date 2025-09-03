# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:20-bullseye AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps

# Copy only package files (works with or without package-lock.json)
COPY package*.json ./

# If lockfile exists, use npm ci (strict + reproducible)
# Otherwise fallback to npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ---- Builder ----
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app (forces webpack, avoids turbopack crashes)
RUN npm run build

# ---- Runner ----
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system nextjs && adduser --system nextjs --ingroup nextjs

# Copy standalone output from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]








