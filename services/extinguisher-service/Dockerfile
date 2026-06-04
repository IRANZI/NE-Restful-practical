# Independent extinguisher service image for inventory APIs and inventory database migrations.
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY migrations ./migrations
COPY src ./src

# Build the TypeScript inventory service.
RUN npm run build

EXPOSE 4012
CMD ["npm", "start"]
