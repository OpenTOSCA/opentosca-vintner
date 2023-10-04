#!/usr/bin/env bash
set -e

ansible-playbook -vv -i inventory.yaml -e @inputs.json delete.yaml