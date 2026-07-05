# ---------- Stage 1: Build React app ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Stage 2: Serve bằng Nginx ----------
FROM nginx:alpine

# Copy file build tĩnh
COPY --from=build /app/dist /usr/share/nginx/html
# Copy cấu hình nginx (SPA + proxy /api)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
