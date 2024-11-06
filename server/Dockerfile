FROM node:20.7.0-alpine
RUN npm install -g pnpm
COPY ./ /app/
WORKDIR /app
RUN : \
    && pnpm install \
    && SHIFTTREE_BUILD_PROD=1 pnpm build \
    && :
CMD ["node", "dist/index.cjs"]