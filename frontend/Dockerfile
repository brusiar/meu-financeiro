FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --no-optional

COPY . .

# Build args para variáveis de ambiente
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

EXPOSE 3000

CMD ["npm", "start"]