#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../../

# Record all casts
./task docs:record:home
./task docs:record:getting-started
