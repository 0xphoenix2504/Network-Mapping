FROM node:22-alpine

WORKDIR /app

# Copy root and workspaces package definitions
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for all packages
RUN npm run postinstall

# Copy source code
COPY . .

# Build frontend production bundle
RUN npm run build

# Expose web server port
EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# Start platform
CMD ["npm", "start"]
