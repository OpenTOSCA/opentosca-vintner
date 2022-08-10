FROM node:16-bullseye

WORKDIR /app
COPY . .
RUN rm -rf node_modules
RUN yarn --frozen-lockfile
RUN yarn lint:check
RUN yarn pretty:check
RUN yarn licenses:check
RUN yarn test:local
RUN yarn build
RUN yarn package
