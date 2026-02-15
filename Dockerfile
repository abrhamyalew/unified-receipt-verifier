FROM node:alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 5000
USER app
CMD ["node", "build/server.js"]