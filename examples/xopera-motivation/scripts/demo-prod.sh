#! /usr/bin/bash
set -e

yarn cli setup clean --force
yarn cli setup init
yarn cli orchestrators init xopera-wsl
yarn cli orchestrators enable --orchestrator xopera-wsl

yarn cli templates import --template motivation --path examples/xopera-motivation
yarn cli instances init --instance motivation --template motivation
yarn cli instances resolve --instance motivation --presets prod
yarn cli instances deploy --instance motivation --inputs examples/xopera-motivation/deployment-inputs.ignored.yaml
