# ── Backend Dockerfile ──────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Create uploads directory
RUN mkdir -p uploads/mess uploads/menu uploads/avatars

EXPOSE 5000

CMD ["node", "server.js"]
