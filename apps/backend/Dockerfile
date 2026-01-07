FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy root package files and workspace definitions
COPY package*.json ./
COPY apps/backend/package*.json apps/backend/
COPY packages/shared-types/package*.json packages/shared-types/

# Install dependencies for all workspaces
RUN npm ci

# Copy source code
COPY . .

# Build the backend application
WORKDIR /usr/src/app/apps/backend
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/apps/backend/package*.json ./apps/backend/
COPY --from=builder /usr/src/app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /usr/src/app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /usr/src/app/packages/shared-types ./packages/shared-types

WORKDIR /usr/src/app/apps/backend

EXPOSE 3000

CMD ["node", "dist/main"]
