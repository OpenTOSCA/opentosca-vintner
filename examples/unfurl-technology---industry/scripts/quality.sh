#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

# Quality
for dir in ../tests/*/;
#for dir in "../tests/gcp";
do
  dir=$(basename $dir)
  echo "${dir}: $($VINTNER template quality --template ${TEMPLATE_DIR}/variable-service-template.yaml --experimental --inputs ${TEMPLATE_DIR}/tests/${dir}/inputs.yaml)"
done
