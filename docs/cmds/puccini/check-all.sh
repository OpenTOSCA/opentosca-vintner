#!/usr/bin/env bash
set -e

# Set working directory
cd "$(dirname "$0")"

DOCS_DIR="../../docs"

# Validate each service template
for TEMPLATE in ${DOCS_DIR}/sofdcar/tosca-sofdcar-profile.yaml ${DOCS_DIR}/sofdcar/tosca-sofdcar-profile-non-normative.yaml ${DOCS_DIR}/sofdcar/guides/location/service-template.yaml ${DOCS_DIR}/sofdcar/guides/zone/service-template.yaml; do
  echo
  ./check.sh $TEMPLATE
done
