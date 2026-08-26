# ==============================================================================
# LQMarket Backend - Production Dockerfile
# Optimized for Node.js 20 Alpine, Fast Startup & Low Footprint
# ==============================================================================

# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* ./

RUN npm install --legacy-peer-deps

# Copy backend source code
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript & bundle server with esbuild into dist/server.cjs
RUN npm run build

# ==============================================================================
# Production Runtime Stage
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy compiled backend bundle from builder
COPY --from=builder /app/dist ./dist

# Create non-root user for enhanced container security
USER node

# Expose API gateway port
EXPOSE 3000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Launch backend
CMD ["node", "dist/server.cjs"]
