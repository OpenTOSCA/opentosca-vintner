#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Start server
node -r dotenv/config -r ts-node/register -r tsconfig-paths/register src/cli/index.ts server start