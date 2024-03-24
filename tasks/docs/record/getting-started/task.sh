#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Record getting-started cast
task docs:record -- getting-started
