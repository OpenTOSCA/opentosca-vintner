#!/usr/bin/bash
set -e

task cli -- template enrich --template ${PWD}/template.yaml --output ${PWD}/enriched.yaml