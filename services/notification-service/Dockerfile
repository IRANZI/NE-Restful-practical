# Independent notification service image for SMTP/email logging and notification storage.
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY migrations ./migrations
COPY src ./src

# Build notification handlers and database code.
RUN npm run build

EXPOSE 4015
CMD ["npm", "start"]
