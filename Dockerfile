# Multi-stage build for full app (backend + frontend)

# Stage 1: Build server
FROM node:20-alpine AS server-build
WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci

COPY server ./
RUN npx prisma generate
RUN npm run build

# Stage 2: Build client
FROM node:20-alpine AS client-build
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client ./
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000

# Server artifacts
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=server-build /app/server/node_modules ./server/node_modules
COPY --from=server-build /app/server/package*.json ./server/
COPY --from=server-build /app/server/prisma ./server/prisma

# Frontend static build
COPY --from=client-build /app/client/dist ./client/dist

EXPOSE 10000

CMD ["sh", "-c", "cd /app/server && npx prisma migrate deploy && cd /app && node server/dist/index.js"]
