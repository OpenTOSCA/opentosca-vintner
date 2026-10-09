#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

# Implement types
$VINTNER template implement --dir ${TEMPLATE_DIR}
