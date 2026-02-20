FROM node:20-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable
WORKDIR /app

FROM base AS deps

COPY apps/web/package.json apps/web/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY apps/web/ ./
RUN pnpm run build

FROM nginx:1.27-alpine AS runtime

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
