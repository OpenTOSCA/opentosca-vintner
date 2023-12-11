#!/bin/bash
set -e

yarn docs:build:commands
yarn docs:generate:interface
yarn docs:generate:dependencies
yarn docs:generate:tests:variability
yarn docs:generate:tests:query
yarn docs:generate:sofdcar
yarn docs:generate:puml
