# Independent gateway image: installs only this service, builds it, and starts the gateway.
FROM node:22-alpine

WORKDIR /app

# Install service dependencies before copying source so Docker can cache packages.
COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY docs ./docs
COPY src ./src

# Compile TypeScript into dist/ for production startup.
RUN npm run build

EXPOSE 4008
CMD ["npm", "start"]
