#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../

# Set path
PATH="$(pwd)/node_modules/.bin:$PATH"

# Package
pkg --config .pkgrc.json build/cli/index.js
