FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache sqlite git python3

COPY package.json package-lock.json ./
RUN npm ci --include=optional --no-audit --no-fund

COPY . .
RUN npm run build

EXPOSE 3333

CMD ["node", "node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3333"]
