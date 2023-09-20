FROM node:18-bullseye

# Setup
WORKDIR /app
COPY . .
RUN yarn --frozen-lockfile

# Test
RUN yarn lint:check
RUN yarn style:check
RUN yarn dependencies:check
RUN yarn puccini:check
RUN yarn test

# Build
RUN yarn build
RUN yarn package

# Docs
RUN apt-get update -y \
    && apt-get install --no-install-recommends python3=3.9.2-3 python3-pip=20.3.4-4+deb11u1 graphviz -y \
    && apt-get clean  \
    && rm -rf /var/lib/apt/lists/*
RUN yarn docs:install
RUN yarn docs:build:commands
RUN yarn docs:generate:dependencies
RUN yarn docs:generate:interface
RUN yarn docs:generate:tests:variability
RUN yarn docs:generate:tests:query
RUN yarn docs:generate:sofdcar
RUN yarn docs:generate:puml

RUN yarn docs:build
