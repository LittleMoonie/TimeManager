# 🐳 GoGoTime Web - Dev Dockerfile
FROM node:24-alpine AS base

# 1️⃣ Build tools
RUN apk add --no-cache curl g++ make python3

WORKDIR /app

# 2️⃣ Pin Yarn
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy dependency manifests first (cache layer)
COPY yarn.lock ./
COPY package.json ./

# 4️⃣ Install dependencies (immutable but fallback-safe)
RUN yarn install --immutable || yarn install

# 5️⃣ Copy source
COPY . .

# 6️⃣ Expose Vite port
ENV NODE_ENV=development
EXPOSE 3000

# 7️⃣ Default dev command
CMD ["yarn", "dev"]
