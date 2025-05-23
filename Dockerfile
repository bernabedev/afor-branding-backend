FROM oven/bun:1.2-slim AS base

WORKDIR /usr/src/app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["bun", "run", "start"]