#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source ../.env

if [[ -z "$NAME" ]]; then
    echo "NAME is not defined"
    exit 1
fi

# TODO: path
yarn cli templates import --template "$NAME" --path examples/unfurl-artifacts
yarn cli instances init --instance "$NAME" --template "$NAME"
# TODO: inputs
yarn cli instances resolve --instance "$NAME" --inputs examples/unfurl-artifacts/tests/enterprise/inputs.yaml
# TODO: inputs
yarn cli instances deploy --instance "$NAME" --inputs examples/unfurl-artifacts/deployment-inputs.ignored.yaml
