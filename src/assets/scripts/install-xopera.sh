#!/bin/bash
set -e

# Ensure that script is executed as root
if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

# Ensure that xOpera is not already installed
if which opera &>/dev/null; then
    echo "\"opera\" already installed"
    exit 0
fi

# Ensure that pip is installed
if ! which pip &>/dev/null; then
    echo "\"pip\" not installed"
    exit 0
fi

# Install xOpera
# openstacksdk 0.61 is required, see https://storyboard.openstack.org/#!/story/2010128
# pyyaml 5.3.1 is required, see https://github.com/yaml/pyyaml/issues/724#issuecomment-1638587228
pip install openstacksdk==0.61 pyyaml==5.3.1 opera==0.6.9