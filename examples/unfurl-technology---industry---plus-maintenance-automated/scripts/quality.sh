#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

# Quality
$VINTNER template quality --template ${TEMPLATE_DIR}/variable-service-template.yaml --experimental
