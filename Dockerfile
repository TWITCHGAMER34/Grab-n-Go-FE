FROM node:alpine3.15 AS vite-builder
WORKDIR /app

COPY ./package.json ./
RUN npm i -g vite && npm i --legacy-peer-deps

COPY . .
RUN vite build

# Stage 3: Production with Nginx
FROM nginx:1.21.0-alpine AS production
COPY --from=vite-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]