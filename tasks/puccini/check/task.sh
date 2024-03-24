#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../

DOCS_DIR="docs/docs"

# Validate each service template
for TEMPLATE in ${DOCS_DIR}/sofdcar/tosca-sofdcar-profile.yaml ${DOCS_DIR}/sofdcar/tosca-sofdcar-profile-core.yaml ${DOCS_DIR}/sofdcar/tosca-sofdcar-profile-extended.yaml ${DOCS_DIR}/sofdcar/guides/location/service-template.yaml ${DOCS_DIR}/sofdcar/guides/zone/service-template.yaml; do
  echo
  task puccini:check:single -- $TEMPLATE
done
