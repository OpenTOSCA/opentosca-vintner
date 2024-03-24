#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Test local
nyc mocha "tests/**/*.ts"