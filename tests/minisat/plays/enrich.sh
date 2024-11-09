#!/bin/bash
set -e

${PWD}/../../../task vintner template enrich --template ${PWD}/play.yaml --output ${PWD}/enriched.old.minimal.yaml
