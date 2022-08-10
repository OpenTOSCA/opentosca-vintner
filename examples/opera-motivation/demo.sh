#! /usr/bin/bash
set -e

yarn vintner setup init
yarn vintner orchestrators init opera-wsl
yarn vintner orchestrators enable --orchestrator opera-wsl

yarn vintner templates import --template motivation --path examples/opera-motivation
yarn vintner instances create --instance motivation --template motivation
yarn vintner instances resolve --instance motivation --preset dev
yarn vintner instances deploy --instance motivation --inputs examples/opera-motivation/inputs.yaml
