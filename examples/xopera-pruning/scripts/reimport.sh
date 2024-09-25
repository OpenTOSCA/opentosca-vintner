#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

$VINTNER instances undeploy --instance ${TEMPLATE_NAME} || true

$VINTNER instances delete --instance ${TEMPLATE_NAME} --force || true
$VINTNER templates delete --template ${TEMPLATE_NAME} || true

$VINTNER template pull --dir ${TEMPLATE_DIR}
$VINTNER templates import --template ${TEMPLATE_NAME}  --path ${TEMPLATE_DIR}
$VINTNER instances init --instance ${TEMPLATE_NAME}  --template ${TEMPLATE_NAME}
$VINTNER instances resolve --instance ${TEMPLATE_NAME} --presets ${VARIANT}
$VINTNER instances validate --instance ${TEMPLATE_NAME} --inputs ${TEMPLATE_DIR}/deployment-inputs.ignored.yaml
$VINTNER instances deploy --instance ${TEMPLATE_NAME}  --inputs ${TEMPLATE_DIR}/deployment-inputs.ignored.yaml
