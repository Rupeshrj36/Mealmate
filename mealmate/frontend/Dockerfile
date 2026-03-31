# ── Frontend Dockerfile ─────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

# CRA dev server
CMD ["npm", "start"]
