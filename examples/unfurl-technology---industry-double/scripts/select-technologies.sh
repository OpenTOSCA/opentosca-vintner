#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

# Select Technologies
for dir in ../tests/*/;
#for dir in "../tests/kubernetes";
do
  dir=$(basename $dir)
  echo "${dir}"

  TMP_DIR="/tmp/vintner-select-technologies"
  rm -rf "${TMP_DIR}"
  mkdir "${TMP_DIR}"
  cp -r ${TEMPLATE_DIR}/* ${TMP_DIR}
  cp ${TEMPLATE_DIR}/tests/${dir}/expected.yaml ${TMP_DIR}/template.yaml

  $VINTNER utils select-technologies --template ${TMP_DIR}/template.yaml --output ${TMP_DIR}/template.enriched.yaml
done
