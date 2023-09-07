#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../

vintner setup clean --force
