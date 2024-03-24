#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Open repository in browser
open-cli https://github.com/opentosca/opentosca-vintner