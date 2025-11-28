# Stage 1 – Build frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build -- --base /

# Stage 2 – Final image
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

EXPOSE 80