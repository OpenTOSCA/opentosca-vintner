#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Build
tsc -p tsconfig.build.json
tsc-alias -p tsconfig.build.json

# Set version
sed -i "s/__VERSION__/$(git rev-parse HEAD)/" build/utils/env.js

# Copy assets
syncdir src/assets build/assets --quiet

# Copy license
cp LICENSE build/assets

# Copy dependencies
cp docs/docs/assets/documents/dependencies.csv build/assets
