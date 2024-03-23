#!/bin/bash
set -e

task cli -- template enrich --template ${PWD}/old.minimal.yaml --output ${PWD}/enriched.old.minimal.yaml
