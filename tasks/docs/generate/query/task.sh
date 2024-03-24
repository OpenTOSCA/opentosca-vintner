#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Generate dependencies
tasks/.bin/ts docs/generate/query
