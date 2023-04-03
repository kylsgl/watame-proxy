FROM node:hydrogen-bullseye-slim as build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    pnpm install --frozen-lockfile
COPY . ./
RUN pnpm build && pnpm prune --prod


FROM gcr.io/distroless/nodejs18-debian11
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json /app/dist ./

ENV INSTANCE=1 \
    NODE_NO_WARNINGS=1 \
    NODE_ENV=production \
    HOST=:: \
    PORT=8080
EXPOSE 8080

CMD ["--experimental-specifier-resolution=node", "server"]
