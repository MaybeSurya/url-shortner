# ── Stage 1: Build Frontend Assets ──────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies required for Vite build)
RUN npm ci --include=dev

# Copy source files
COPY . .

# Build Vite frontend assets into /dist
RUN npm run build

# Prune devDependencies to keep final production node_modules clean
RUN npm prune --omit=dev

# ── Stage 2: Production Runtime ──────────────────────────────────────────────
FROM node:22-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# Copy production node_modules and built frontend dist from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/custom ./custom
COPY --from=builder /app/static ./static
COPY --from=builder /app/knexfile.js ./knexfile.js

# Create default data directory for SQLite if used
RUN mkdir -p db

# Expose HTTP ports (Koyeb default port 8080 and 3000)
EXPOSE 8080 3000

# Execute database migrations and start production server
CMD ["sh", "-c", "npm run migrate && npm start"]