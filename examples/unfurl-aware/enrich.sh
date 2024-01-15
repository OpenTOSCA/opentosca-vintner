#!/bin/bash
set -e

yarn cli template enrich --template ${PWD}/variable-service-template.yaml --output ${PWD}/enriched.yaml
