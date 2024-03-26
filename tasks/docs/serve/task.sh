#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Serve mkdocs (hot-reload)
export MKDOCS_IS_DEV=true
export MKDOCS_REVISION_ENABLED=false
bash docs/mkdocs serve --watch-theme
