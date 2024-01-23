FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x /usr/src/app/wait-for-it.sh

EXPOSE 3000
