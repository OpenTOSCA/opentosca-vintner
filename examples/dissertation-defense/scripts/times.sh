#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

# Ensure vintner binary is used
VINTNER=/usr/bin/vintner
if [[ ! -f "${VINTNER}" ]]; then
    echo "vintner binary located at \"${VINTNER}\" must be used"
    exit 0
fi

# Prepare
rm -rf /tmp/boutique-model
cp -R ${TEMPLATE_DIR} /tmp/boutique-model

# Enrich
echo "Enriching ..."
time $VINTNER template enrich --template /tmp/boutique-model/variable-service-template.yaml --output /tmp/boutique-model/variable-service-template.yaml
echo
echo

# Resolve
for DIR in ../tests/*/;
do
  DIR=$(basename $DIR)
  echo "Resolving \"${DIR}\" ..."
  time $VINTNER template resolve --template /tmp/boutique-model/variable-service-template.yaml --output /tmp/boutique-model/variable-service-template-${DIR}.yaml --inputs ${TEMPLATE_DIR}/tests/${DIR}/inputs.yaml
  echo
  echo
done