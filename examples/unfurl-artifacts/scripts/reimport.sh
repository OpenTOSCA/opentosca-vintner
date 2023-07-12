#! /usr/bin/bash
set -e

yarn cli instances delete --instance artifacts
yarn cli templates delete --template artifacts

yarn cli templates import --template artifacts --path examples/unfurl-artifacts
yarn cli instances create --instance artifacts --template artifacts
yarn cli instances resolve --instance artifacts --inputs examples/unfurl-artifacts/tests/community/inputs.yaml
yarn cli instances deploy --instance artifacts --inputs examples/unfurl-artifacts/deployment-inputs.ignored.yaml