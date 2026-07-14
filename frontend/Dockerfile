FROM node:20-alpine AS build

WORKDIR /src

COPY package*.json ./

RUN npm ci

COPY . .

# Vite inlina as variaveis VITE_* no bundle em tempo de build.
ARG VITE_API_URL=http://localhost:8080
ARG APP_VERSION=1.0.0

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_VERSION=$APP_VERSION

RUN npm run build

FROM nginx:1.27-alpine

ARG APP_VERSION=1.0.0

LABEL org.opencontainers.image.version=$APP_VERSION
LABEL org.opencontainers.image.title="Solidarity Frontend"

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /src/dist /usr/share/nginx/html

EXPOSE 80
