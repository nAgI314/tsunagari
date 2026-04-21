FROM oven/bun:1.2.20

WORKDIR /app

COPY tsconfig.base.json ./tsconfig.base.json
COPY shared ./shared
COPY backend ./backend

WORKDIR /app/backend
RUN bun install --frozen-lockfile

EXPOSE 3000

CMD ["sh", "-c", "bun run db:migration:run && bun run start"]
