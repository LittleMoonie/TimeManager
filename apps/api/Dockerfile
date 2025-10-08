# 🐳 GoGoTime API - Dev Dockerfile
FROM node:24-alpine

# Install native build tools for bcrypt, etc.
RUN apk add --no-cache curl g++ make python3

WORKDIR /app

# Pin Yarn to 4.10.3 (latest stable)
RUN corepack enable && corepack prepare yarn@4.10.3 --activate

# Copy dependency manifests first (cache layer)
COPY package.json yarn.lock ./

# Install dependencies with strict mode (fallback for dev env)
RUN yarn install --immutable || yarn install

# Copy source code
COPY . .

# Sanity check to confirm compression exists
RUN ls node_modules | grep compression || true

# Expose API port
EXPOSE 4000

# Default dev command
CMD ["yarn", "dev"]
