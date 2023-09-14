#! /usr/bin/bash
set -e

yarn cli templates import --template pruning --path examples/xopera-pruning
yarn cli instances init --instance pruning --template pruning
yarn cli instances resolve --instance pruning --presets elastic
yarn cli instances deploy --instance pruning --inputs examples/xopera-pruning/deployment-inputs.ignored.yaml