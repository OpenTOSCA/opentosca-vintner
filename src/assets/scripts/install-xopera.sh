#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

if which opera &>/dev/null; then
    echo "\"opera\" already installed"
    exit 0
fi

# openstacksdk 0.61 is required, see https://storyboard.openstack.org/#!/story/2010128
# pyyaml 5.3.1 is required, see https://github.com/yaml/pyyaml/issues/724#issuecomment-1638587228
pip install openstacksdk==0.61 pyyaml==5.3.1 opera==0.6.9