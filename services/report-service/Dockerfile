# Independent report service image for summaries and CSV export APIs.
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY migrations ./migrations
COPY src ./src

# Compile the reporting service before runtime.
RUN npm run build

EXPOSE 4014
CMD ["npm", "start"]
