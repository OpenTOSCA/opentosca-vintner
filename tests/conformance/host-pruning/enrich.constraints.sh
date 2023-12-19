#!/bin/bash
set -e

yarn cli template enrich --template ${PWD}/template.constraints.yaml --output ${PWD}/enriched.constraints.yaml
