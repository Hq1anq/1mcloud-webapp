# ==============================
# Build Frontend (Vite)
# ==============================
FROM node:20-alpine AS client-build

WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ .
RUN npm run build


# ==============================
# Build Backend
# ==============================
FROM node:20-alpine

WORKDIR /app/server

# Copy package files trước để tối ưu cache
COPY server/package*.json ./
RUN npm install --production

# Copy source code
COPY server/ .

# Copy frontend dist vào đúng vị trí backend serve static
COPY --from=client-build /app/client/dist ../client/dist

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

CMD ["node", "src/server.js"]