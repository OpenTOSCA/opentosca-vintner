#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

$VINTNER pull ${TEMPLATE_DIR}
