#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

# Pull dependencies
$VINTNER template implement --dir ${TEMPLATE_DIR}

