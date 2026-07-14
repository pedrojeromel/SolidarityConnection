FROM node:20-alpine AS build

WORKDIR /src

COPY package*.json ./

RUN npm ci

COPY . .

# A URL da API entra no bundle em tempo de build (Vite inlina VITE_*).
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /src/dist /usr/share/nginx/html

EXPOSE 80
