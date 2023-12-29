#!/usr/bin/env sh
set -e

# Ensure that vintner is installed
if ! which vintner &>/dev/null; then
    echo "\"vintner\" not installed"
    exit 1
fi

. magic.sh -n
TYPE_SPEED=100

# Set working directory
cd "$(dirname "$0")"
cd ../../../

echo '# Installation'
p 'curl -fsSL https://vintner.opentosca.org/install.sh | sudo bash -'
sleep 3

# Is part of the installation
vintner setup init

echo ''
echo '# Orchestrator'

pe 'vintner orchestrators init xopera'
# sleep 0.5

pe 'vintner orchestrators enable --orchestrator xopera'
# sleep 0.5

echo ''
echo '# Deployment'

pe 'vintner templates import --template getting-started --path examples/xopera-getting-started'
# sleep 0.5

pe 'vintner instances init --instance getting-started --template getting-started'
# sleep 0.5

pe 'vintner instances resolve --instance getting-started --inputs examples/xopera-getting-started/variability-inputs.example.yaml'
## sleep 0.5

pe 'vintner instances deploy --instance getting-started'
## sleep 0.5

echo ''
echo '# Results'
pe 'cat /tmp/vintner-getting-started.txt'
#echo 'First Textfile has been selected!'
# sleep 0.5

echo ''
echo ''
echo '# Undeployment'
pe 'vintner instances undeploy --instance getting-started'
# sleep 0.5
