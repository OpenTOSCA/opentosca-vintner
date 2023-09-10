#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../

# Cleanup
vintner setup clean --force
