#! /usr/bin/bash
set -e

yarn cli setup clean --force

yarn cli setup init
yarn cli orchestrators init xopera-wsl
yarn cli orchestrators enable --orchestrator xopera-wsl

yarn cli templates import --template pipes-and-filters --path examples/xopera-pipes-and-filters
yarn cli instances init --instance pipes-and-filters --template pipes-and-filters
yarn cli instances resolve --instance pipes-and-filters --presets raspberry
yarn cli instances deploy --instance pipes-and-filters --inputs examples/xopera-pipes-and-filters/deployment-inputs.ignored.yaml
