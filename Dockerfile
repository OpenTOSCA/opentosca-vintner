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
RUN apt-get update -y \
    && apt-get install --no-install-recommends python3=3.9.2-3 python3-pip=20.3.4-4+deb11u1 -y \
    && apt-get clean  \
    && rm -rf /var/lib/apt/lists/*
RUN yarn docs:install
RUN yarn docs:generate:licenses
RUN yarn docs:generate:interface
RUN yarn docs:build
