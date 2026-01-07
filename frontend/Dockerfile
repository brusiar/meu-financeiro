FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps && npm install ajv@^8.12.0

COPY . .

EXPOSE 3000

CMD ["npm", "start"]