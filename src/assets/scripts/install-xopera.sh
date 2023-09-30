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

# pyyaml 5.3.1 is required, see https://github.com/yaml/pyyaml/issues/724#issuecomment-1638587228
pip install openstacksdk==1.0.0 pyyaml==5.3.1 opera==0.6.9