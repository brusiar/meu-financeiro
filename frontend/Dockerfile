FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --no-optional

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]