#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Generate CSAR of getting started guide
task cli -- template init --path examples/xopera-getting-started --force