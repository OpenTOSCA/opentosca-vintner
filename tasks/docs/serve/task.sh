#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../

# Serve mkdocs (hot-reload)
MKDOCS_IS_DEV=true
export MKDOCS_IS_DEV

MKDOCS_REVISION_ENABLED=false
export MKDOCS_REVISION_ENABLED

bash docs/mkdocs serve --watch-theme
