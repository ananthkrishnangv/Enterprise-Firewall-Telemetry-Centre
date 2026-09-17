# Ultra-lightweight Alpine Linux Production Image
FROM node:22-alpine

LABEL maintainer="Government of India - National Firewall Operations Console"
LABEL description="UX4G Mandated Core Violet Firewall Operations & Telemetry Platform"

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV SYSLOG_PORT=1514
ENV NETFLOW_PORT=2055
ENV DATA_DIR=/app/data

# Add curl, net-snmp-tools and configure Indian timezone
RUN apk add --no-cache curl tzdata net-snmp-tools iproute2 bash && \
    cp /usr/share/zoneinfo/Asia/Kolkata /etc/localtime && \
    echo "Asia/Kolkata" > /etc/timezone && \
    apk del tzdata && \
    mkdir -p /app/data /app/uploads

# Install production dependencies only
COPY server/package.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Copy compiled server application and Vue 3.5 static bundle
COPY server/dist ./dist
COPY client/dist ./public
COPY client/dist ./dist/public
COPY client/dist /app/client/dist

# Expose standard HTTP and collector ports
EXPOSE 80 1514/udp 2055/udp 514/udp

VOLUME ["/app/data", "/app/uploads"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

CMD ["node", "dist/index.js"]
