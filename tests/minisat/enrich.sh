#!/bin/bash
set -e

yarn cli template enrich --template ${PWD}/template.play.yaml --output ${PWD}/enriched.play.yaml
