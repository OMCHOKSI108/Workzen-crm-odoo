# Simple Railway deployment - Backend only
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend application code
COPY backend/ ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001
RUN chown -R backend:nodejs /app
USER backend

# Expose port (Railway will provide PORT env var)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start application
CMD ["npm", "start"]