#! /usr/bin/bash
set -e

yarn cli setup clean

yarn cli setup init
yarn cli orchestrators init xopera-wsl
yarn cli orchestrators enable --orchestrator xopera-wsl

yarn cli templates import --template motivation --path examples/xopera-self-adaptation
yarn cli instances create --instance motivation --template motivation
yarn cli instances resolve --instance motivation --preset raspberry
yarn cli instances deploy --instance motivation --inputs examples/xopera-self-adaptation/deployment-inputs.ignored.yaml
