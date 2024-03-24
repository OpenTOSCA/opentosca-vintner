#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Warning
echo 'Dont forget to run "./task docs:build:commands" in advance ...'

# Generate interface
tasks/.bin/ts docs/generate/interface
