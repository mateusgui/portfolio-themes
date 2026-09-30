# Imagem opcional do front (o deploy do MVP é estático, sem Docker).
# Build a partir da raiz do monorepo:
#   docker build -f apps/web/Dockerfile -t portfolio-web .
#   docker run --rm -p 8080:80 portfolio-web

FROM node:24-alpine AS build
WORKDIR /repo
ENV HUSKY=0

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
RUN npm ci --workspace web --include-workspace-root

COPY apps/web apps/web
ARG VITE_SITE_URL
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build --workspace web

FROM nginx:1.29-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80
