#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Execute TS
ts-node -r tsconfig-paths/register src/cli/index ${@}