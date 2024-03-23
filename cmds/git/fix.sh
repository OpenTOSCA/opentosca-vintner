#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../

# Set path
PATH="$(pwd)/node_modules/.bin:$PATH"

git add . && git commit -m fix && git push