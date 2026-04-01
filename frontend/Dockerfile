# ---------- 1. Build Stage ----------
FROM node:20-alpine AS fe-k8s-egitim
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app and build
COPY . .
RUN npm run build

# ---------- 2. Runtime Stage ----------
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files
COPY --from=fe-k8s-egitim /app/dist /usr/share/nginx/html

# Base URL environment variable
# Frontend kodunda process.env.BASE_URL olarak kullanabilirsin
ENV BASE_URL=http://localhost:8080

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]