# 🐳 GoGoTime React Dev Environment
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Enable Yarn
RUN corepack enable && corepack prepare yarn@stable --activate

# Copy package manifests and install dependencies
COPY package.json yarn.lock* ./

# Install dependencies with strict mode (fallback for dev env)
RUN yarn install --immutable || yarn install

# Fix Rollup native binary for Alpine Linux (multiple approaches)
RUN yarn add @rollup/rollup-linux-x64-musl --dev --optional || true
RUN npm install @rollup/rollup-linux-x64-musl --save-optional || true

# Copy source code
COPY . .

# Expose default dev port
EXPOSE 3000

# Run development server
CMD ["yarn", "dev", "--debug"]