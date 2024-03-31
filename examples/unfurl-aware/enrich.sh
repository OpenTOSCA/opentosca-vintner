#!/bin/bash
set -e

task cli -- template enrich --template ${PWD}/variable-service-template.yaml --output ${PWD}/enriched.yaml
