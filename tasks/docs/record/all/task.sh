#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Record all casts
./task docs:record:home
./task docs:record:getting-started
