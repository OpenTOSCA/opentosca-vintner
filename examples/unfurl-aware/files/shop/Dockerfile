FROM node:18.15 as run

WORKDIR /app

COPY index.js .
COPY package.json .
COPY package-lock.json .

RUN npm install --frozen
CMD npm start