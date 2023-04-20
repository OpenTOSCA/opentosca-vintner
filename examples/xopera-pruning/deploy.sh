#! /usr/bin/bash
set -e

yarn cli instances deploy --instance pruning --inputs examples/xopera-pruning/deployment-inputs.ignored.yaml
