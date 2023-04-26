#! /usr/bin/bash
set -e

yarn cli setup clean

yarn cli setup init
yarn cli orchestrators init xopera-wsl
yarn cli orchestrators enable --orchestrator xopera-wsl

yarn cli templates import --template pruning --path examples/xopera-pruning
yarn cli instances create --instance pruning --template pruning
yarn cli instances resolve --instance pruning --presets cloud
yarn cli instances deploy --instance pruning --inputs examples/xopera-pruning/deployment-inputs.ignored.yaml
