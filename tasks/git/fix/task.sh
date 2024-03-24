#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Add, commit, and push current changes
git add . && git commit -m fix && git push