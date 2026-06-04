# Independent inspection service image for inspection scheduling and maintenance logs.
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY migrations ./migrations
COPY src ./src

# Build inspection and maintenance APIs into dist/.
RUN npm run build

EXPOSE 4013
CMD ["npm", "start"]
