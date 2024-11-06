FROM node:20.7.0-alpine AS build
RUN npm install -g pnpm
COPY ./ /app/
WORKDIR /app
RUN : \
    && pnpm install \
    && VITE_SHIFTTREE_BASE_URL=/api/ pnpm build \
    && :

FROM caddy:alpine
COPY --from=build /app/dist/ /www/
COPY ./Caddyfile /etc/caddy/Caddyfile