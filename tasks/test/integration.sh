#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Test integration
ENABLE_INTEGRATION_TESTS=true nyc mocha "tests/integration/**/*.ts"