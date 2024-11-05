#!/bin/bash
set -e

./task template enrich --template ${PWD}/old.minimal.yaml --output ${PWD}/enriched.old.minimal.yaml
