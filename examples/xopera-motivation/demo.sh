#! /usr/bin/bash
set -e

yarn vintner setup init
yarn vintner orchestrators init xopera-wsl
yarn vintner orchestrators enable --orchestrator xopera-wsl

yarn vintner templates import --template motivation --path examples/xopera-motivation
yarn vintner instances create --instance motivation --template motivation
yarn vintner instances resolve --instance motivation --preset dev
yarn vintner instances deploy --instance motivation --inputs examples/xopera-motivation/inputs.yaml
