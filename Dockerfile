FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
COPY client/package.json client/bun.lock ./client/
RUN bun install --frozen-lockfile
RUN cd client && bun install --frozen-lockfile

# Build client
FROM deps AS build-client
COPY client/ ./client/
RUN cd client && bun run build

# Generate Prisma client
FROM deps AS build-server
COPY prisma/ ./prisma/
RUN bunx prisma generate

# Production image
FROM base AS production
ENV NODE_ENV=production

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY --from=build-server /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build-server /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build-client /app/client/dist ./client/dist
COPY server/ ./server/
COPY prisma/ ./prisma/
COPY start.ts ./

# Create data directory for SQLite (will be mounted as a volume)
RUN mkdir -p /data

EXPOSE 8080
CMD ["bun", "run", "start.ts"]
