#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Serve server (hot-reload)
nodemon -r dotenv/config -r tsconfig-paths/register --ext "ts,json" src/cli/index.ts server start