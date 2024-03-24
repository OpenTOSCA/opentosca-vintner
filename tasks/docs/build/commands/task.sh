#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Build commands
tsc -p tsconfig.tasks.json
tsc-alias -p tsconfig.tasks.json

syncdir tasks build-tasks/tasks --quiet
syncdir tests build-tasks/tests --quiet
syncdir src/assets build-tasks/src/assets --quiet
