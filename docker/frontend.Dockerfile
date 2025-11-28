FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
ARG VITE_API_BASE_URL=http://localhost/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM alpine:latest
RUN mkdir -p /dist-out
COPY --from=builder /app/dist/ /dist-out/
CMD ["echo", "Frontend built successfully!"]