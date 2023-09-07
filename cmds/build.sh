#!/usr/bin/env bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../

# build
tsc -p tsconfig.build.json
tsc-alias -p tsconfig.build.json

# set version
sed -i "s/__VERSION__/$(git rev-parse HEAD)/" build/cli/config.js

# copy assets
syncdir src/assets build/assets --quiet
cp LICENSE build/assets
cp docs/docs/assets/documents/dependencies.csv build/assets
