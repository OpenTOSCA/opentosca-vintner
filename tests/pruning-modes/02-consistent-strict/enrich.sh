#!/bin/bash
set -e

yarn cli template enrich --template ${PWD}/template.yaml --output ${PWD}/enriched.yaml