FROM node:20-alpine AS build

WORKDIR /app

COPY tsconfig.base.json ./tsconfig.base.json
COPY shared ./shared
COPY frontend ./frontend

WORKDIR /app/frontend
RUN npm ci

ARG VITE_PUBLIC_APP_ORIGIN
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_PUBLIC_APP_ORIGIN=$VITE_PUBLIC_APP_ORIGIN
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

FROM httpd:2.4-alpine AS runtime

# COPY frontend/apache/httpd.conf /usr/local/apache2/conf/httpd.conf
COPY --from=build /app/frontend/dist /usr/local/apache2/htdocs

EXPOSE 80
