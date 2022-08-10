# Setup demo-magic
. magic.sh -n
TYPE_SPEED=100

cd ../../../

echo '# Installation'
p 'curl -sL https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-x64'
# sleep 0.5

p 'mv vintner-linux-x64 /usr/bin/vintner'
# sleep 0.5

p 'chmod +x /usr/bin/vintner'
# sleep 0.5

pe 'vintner setup init'
# sleep 0.5

echo ''
echo '# Setup'

pe 'vintner orchestrators init opera'
# sleep 0.5

pe 'vintner orchestrators enable --orchestrator opera'
# sleep 0.5

echo ''
echo '# Deployment'

pe 'vintner templates import --template getting-started --path examples/opera-getting-started'
# sleep 0.5

pe 'vintner instances create --instance getting-started --template getting-started'
# sleep 0.5

pe 'vintner instances resolve --instance getting-started --inputs examples/opera-getting-started/inputs.example.yaml'
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
