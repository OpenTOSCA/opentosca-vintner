#!/usr/bin/bash
set -e

echo "Building commands ..."
yarn docs:build:commands

echo "Generating docs ..."
yarn docs:generate:interface
yarn docs:generate:dependencies
yarn docs:generate:tests:variability
yarn docs:generate:tests:query
yarn docs:generate:sofdcar
yarn docs:generate:puml
