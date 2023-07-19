#! /usr/bin/bash
set -e

yarn cli templates import --template plans --path examples/xopera-plans
yarn cli instances init --instance plans --template plans
yarn cli instances resolve --instance plans --inputs examples/xopera-plans/tests/community/inputs.yaml
yarn cli instances deploy --instance plans --inputs examples/xopera-plans/deployment-inputs.ignored.yaml