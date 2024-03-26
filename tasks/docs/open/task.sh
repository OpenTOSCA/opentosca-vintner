#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../

# Open local docs in browser
open-cli http://localhost:8000
