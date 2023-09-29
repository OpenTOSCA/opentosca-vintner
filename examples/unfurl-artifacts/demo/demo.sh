#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../

# install vintner
sudo npm install -g opentosca-vintner

# setup
vintner setup init

# repo
git clone https://github.com/OpenTOSCA/opentosca-vintner.git
cd opentosca-vintner
git lfs install
git lfs pull

# examples
cd opentosca-vintner/examples
ls -ll

# import variable service template
vintner templates import --template artifacts --path unfurl-artifacts

# list templates
vintner templates list

# inspect variable service template
vintner templates inspect --template artifacts

# init
vintner instances init --instance artifacts --template artifacts

# inspect variability inputs
cat unfurl-artifacts/tests/enterprise/inputs.yaml

# resolve
vintner instances resolve --instance artifacts --inputs unfurl-artifacts/tests/enterprise/inputs.yaml

# inspect variability-resolved deployment model
vintner instances inspect --instance artifacts

# unfurl
vintner setup utils --unfurl
vintner orchestrators init unfurl
vintner orchestrators enable --orchestrator unfurl

# inspect deployment inputs
cat ../../deployment-inputs.yaml

# deploy
vintner instances deploy --instance artifacts --inputs ../../deployment-inputs.yaml

# test
curl https://shop-dot-stoetzms-387808.ey.r.appspot.com
