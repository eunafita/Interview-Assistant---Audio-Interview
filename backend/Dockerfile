# ---------------------------------------------
# Backend Dockerfile - Interview Assistant API
# ---------------------------------------------

# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first (optimize cache)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the app (NestJS)
RUN npm run build

# Expose API port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]
