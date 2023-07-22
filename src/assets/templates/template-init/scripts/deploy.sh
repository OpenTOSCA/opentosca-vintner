#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

$VINTNER templates import --template ${TEMPLATE_NAME} --path ${TEMPLATE_DIR}
$VINTNER instances init --instance ${TEMPLATE_NAME} --template ${TEMPLATE_NAME}
$VINTNER instances resolve --instance ${TEMPLATE_NAME} --inputs ${TEMPLATE_DIR}/tests/one/inputs.yaml
$VINTNER instances deploy --instance ${TEMPLATE_NAME} --inputs ${TEMPLATE_DIR}/deployment-inputs.ignored.yaml
