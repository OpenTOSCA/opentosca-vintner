#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

# Quality
for dir in ../tests/*/;
do
  dir=$(basename $dir)
  echo "${dir}: $($VINTNER template quality --template ${TEMPLATE_DIR}/variable-service-template.yaml --inputs ${TEMPLATE_DIR}/tests/${dir}/inputs.yaml)"
done