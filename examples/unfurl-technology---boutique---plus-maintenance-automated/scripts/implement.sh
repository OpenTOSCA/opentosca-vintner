#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

# Implement types
$VINTNER template implement --dir ${TEMPLATE_DIR} --experimental
