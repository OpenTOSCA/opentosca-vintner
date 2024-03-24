#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

DOCS_DIR="../../docs"

# Plot all files
./plantuml -tsvg ${DOCS_DIR}/**.puml
