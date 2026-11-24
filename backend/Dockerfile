# Production Multi-Stage Dockerfile for Express Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Final lean runtime image
FROM node:20-alpine AS runner

WORKDIR /app

# Set non-root user for security compliance
USER node

COPY --chown=node:node --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=5050

EXPOSE 5050

# Docker healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5050/health || exit 1

CMD ["node", "src/server.js"]
