FROM node:16-bullseye

# Setup
WORKDIR /app
COPY . .
RUN yarn --frozen-lockfile

# Test
RUN yarn lint:check
RUN yarn style:check
RUN yarn licenses:check
RUN yarn test

# Build
RUN yarn build
RUN sed -i "s/__VERSION__/${GITHUB_SHA}/" build/cli/config.js
RUN yarn package

# Docs
RUN apt-get update -y && apt-get install python3 python3-pip -y
RUN yarn docs:install
RUN yarn licenses:generate
RUN yarn interface:generate
RUN yarn docs:build
