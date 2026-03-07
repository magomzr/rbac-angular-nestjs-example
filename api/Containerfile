FROM node:24-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db ./src/db
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY entrypoint.sh ./entrypoint.sh
RUN sed -i 's/\r$//' entrypoint.sh
RUN chmod +x entrypoint.sh
EXPOSE 3000
CMD ["sh", "entrypoint.sh"]
