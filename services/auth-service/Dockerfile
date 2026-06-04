# Independent auth service image with its own user database migration and seed scripts.
FROM node:22-alpine

WORKDIR /app

# Cache dependency installation for faster rebuilds.
COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY migrations ./migrations
COPY src ./src

# Build the service API before it starts.
RUN npm run build

EXPOSE 4011
CMD ["npm", "start"]
