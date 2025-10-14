# 🐳 GoGoTime API - Dev Dockerfile
FROM node:24-alpine

# Install native build tools for bcrypt, etc.
RUN apk add --no-cache curl g++ make python3

WORKDIR /app/App.API

# Pin Yarn to 4.10.3 (latest stable)
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy dependency manifests first (cache layer)
COPY yarn.lock ./
COPY App.API/package.json ./

# Install dependencies with strict mode (fallback for dev env)
RUN yarn install

# Copy source code
COPY App.API/. .

# Expose API port
EXPOSE 4000

# Default dev command
CMD ["yarn", "dev"]
