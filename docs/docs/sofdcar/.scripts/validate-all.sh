#!/usr/bin/env bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Validate each service template
for TEMPLATE in tosca-sofdcar-profile.yaml tosca-sofdcar-profile-non-normative.yaml guides/location/service-template.yaml guides/zone/service-template.yaml; do
  echo
  echo
  ./validate.sh $TEMPLATE
done
