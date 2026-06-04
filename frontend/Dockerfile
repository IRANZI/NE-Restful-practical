# Build the Vite frontend and serve it with nginx for a small production container.
FROM node:22-alpine AS build

WORKDIR /app

# Install packages first to make rebuilds faster when only source files change.
COPY package*.json ./
RUN npm ci

# Vite reads this build argument when producing the static bundle.
ARG VITE_API_URL=http://localhost:4008/api
ENV VITE_API_URL=$VITE_API_URL

COPY index.html ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY src ./src

RUN npm run build

FROM nginx:1.27-alpine

# The nginx config keeps the single-page app working on browser refresh.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
