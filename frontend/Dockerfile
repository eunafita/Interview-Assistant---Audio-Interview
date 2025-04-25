# ---------------------------------------------
# Frontend Dockerfile - Interview Assistant Web
# ---------------------------------------------

# Stage 1: Build Angular app
FROM node:18 as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app files and build
COPY . .
RUN npm run build --prod

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Copy built Angular app to nginx directory
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
