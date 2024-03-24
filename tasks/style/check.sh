#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Check
prettier --check --end-of-line auto "./**/*.{ts,json,yaml,yml}"