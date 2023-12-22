FROM node:18.15 as run

WORKDIR /app
COPY source .
RUN npm install --frozen
CMD npm start