#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../../

# Record getting-started cast
./task docs:record getting-started
