# ---------------------------------------------
# Frontend Dockerfile - Interview Assistant Web
# ---------------------------------------------

# Stage 1: Build Angular app
FROM node:18 as builder

WORKDIR /app

# Copy package.json and package-lock.json separately to leverage cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app source code
COPY . .

# Build Angular production files
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular files from builder stage
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

