#! /usr/bin/bash
set -e

yarn vintner setup init
yarn vintner orchestrators init unfurl
yarn vintner orchestrators enable --orchestrator unfurl

yarn vintner templates import --template motivation --path examples/unfurl-motivation
yarn vintner instances create --instance motivation --template motivation
yarn vintner instances resolve --instance motivation --preset dev
yarn vintner instances deploy --instance motivation --inputs examples/unfurl-motivation/inputs.yaml
