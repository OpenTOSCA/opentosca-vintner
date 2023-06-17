#!/usr/bin/env bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Validate each service template
for TEMPLATE in sofdcar-example-zone/template.yaml sofdcar-example-location/template.yaml; do
    echo
    echo
    ./validate.sh $TEMPLATE || true
done
