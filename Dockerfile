FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package descriptors
COPY package.json package-lock.json ./

# Install dependencies (including devDependencies required for Vite frontend build)
RUN npm ci

# Copy application source code
COPY . .

# Build Vite frontend assets into /dist
RUN npm run build

# Expose ports for Koyeb / Docker
EXPOSE 8080 3000

# Run database migrations and start production server
CMD ["sh", "-c", "npm run migrate && npm start"]