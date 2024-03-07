#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

# Pull dependencies
$VINTNER template pull --template ${TEMPLATE_DIR}

