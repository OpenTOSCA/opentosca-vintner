#!/bin/bash
set -e

yarn cli template enrich --template ${PWD}/old.minimal.yaml --output ${PWD}/enriched.old.minimal.yaml
