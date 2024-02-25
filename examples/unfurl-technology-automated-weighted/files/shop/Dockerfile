FROM node:18-alpine3.14 as run

WORKDIR /app

COPY index.js .
COPY package.json .
COPY package-lock.json .

RUN npm ci
CMD npm start