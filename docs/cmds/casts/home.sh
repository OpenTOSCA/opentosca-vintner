#!/usr/bin/env sh
set -e

. magic.sh -n
TYPE_SPEED=100

p 'vintner setup init'
sleep 0.5

p 'vintner plugins init opera'
sleep 0.5

p 'vintner plugins enable --orchestrator opera'
sleep 0.5

p 'vintner templates import --template ${TEMPLATE_NAME} --path ${TEMPLATE_PATH}'
sleep 0.5

p 'vintner instances create --instance ${INSTANCE_NAME} --template ${TEMPLATE_NAME}'
sleep 0.5

p 'vintner instances resolve --instance ${INSTANCE_NAME} --preset ${PRESET_NAME}'
sleep 0.5

p 'vintner instances deploy --instance ${INSTANCE_NAME} --inputs ${INPUTS_PATH}'
sleep 0.5

echo 'Application has been deployed!'
