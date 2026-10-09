#!/bin/bash
set -e

# Load configuration
source configuration.sh

# Enrich
$VINTNER template enrich --template ${TEMPLATE_DIR}/variable-service-template.yaml --output ${TEMPLATE_DIR}/enriched.yaml
