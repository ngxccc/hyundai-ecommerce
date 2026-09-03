FROM oven/bun:1.3-alpine AS base
WORKDIR /usr/src/app

# Stage 2: Install all dependencies (development + production) for building
FROM base AS install
COPY package.json bun.lock ./
RUN HUSKY=0 bun install --frozen-lockfile

# Stage 3: Install production dependencies only
FROM base AS prod-install
COPY package.json bun.lock ./
RUN bun install --prod --frozen-lockfile --ignore-scripts

# Stage 4: Build the application
FROM base AS builder
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .
RUN bun run build

# Stage 5: Production runner stage
FROM base AS runner

ENV NODE_ENV=production

# Ensure non-root user and group 'bun' exist (handling both clean Alpine and Bun official base images)
RUN grep -q '^bun:' /etc/group || addgroup -g 1001 -S bun && \
    grep -q '^bun:' /etc/passwd || adduser -S -u 1001 -G bun bun

# Use non-root user for security
USER bun

# Copy dependencies and build artifacts from previous stages
COPY --chown=bun:bun --from=prod-install /usr/src/app/node_modules ./node_modules
COPY --chown=bun:bun --from=builder /usr/src/app/dist ./dist
COPY --chown=bun:bun package.json ./

EXPOSE 3000

# Healthcheck using wget (available in Alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --spider -q http://localhost:3000/ || exit 1

CMD ["bun", "dist/main.js"]
