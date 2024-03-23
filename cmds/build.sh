#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../

# Build
bash node_modules/.bin/tsc -p tsconfig.build.json
bash node_modules/.bin/tsc-alias -p tsconfig.build.json

# Set version
sed -i "s/__VERSION__/$(git rev-parse HEAD)/" build/utils/env.js

# Copy assets
bash node_modules/.bin/syncdir src/assets build/assets --quiet

# Copy license
cp LICENSE build/assets

# Copy dependencies
cp docs/docs/assets/documents/dependencies.csv build/assets
