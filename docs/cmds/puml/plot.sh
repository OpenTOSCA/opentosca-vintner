#!/usr/bin/env bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Plot all files
./plantuml -tsvg ../**.puml
