FROM oven/bun:1.2 AS builder
WORKDIR /usr/src/app

RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev pkg-config && \
    rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
COPY prisma ./prisma/

RUN bun install --frozen-lockfile

COPY . .

FROM oven/bun:1.2-slim AS production
WORKDIR /usr/src/app

RUN apt-get update -y && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/bun.lock ./bun.lock
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src

EXPOSE 3000
CMD ["bun", "run", "start"]