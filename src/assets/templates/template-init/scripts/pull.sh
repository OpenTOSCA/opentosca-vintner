#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

$VINTNER template pull --dir ${TEMPLATE_DIR}
