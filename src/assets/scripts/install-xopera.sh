#!/usr/bin/bash
set -e

VENV_DIR=${VENV_DIR:-~/opera}

# Ensure that pip is installed
if ! which pip &>/dev/null; then
    echo "\"pip\" not installed"
    exit 0
fi

# Ensure that python3 is installed
if ! which python3 &>/dev/null; then
    echo "\"python3\" not installed"
    exit 0
fi

# Ensure that venv dir is set
if [ -z "${VENV_DIR}" ]; then
  echo "venv dir not defined"
  exit 1
fi

# Create and use venv
mkdir -p "${VENV_DIR}"
cd "${VENV_DIR}"
python3 -m venv .venv && . .venv/bin/activate

# Install xOpera
# openstacksdk 0.61 is required, see https://storyboard.openstack.org/#!/story/2010128
# pyyaml 5.3.1 is required, see https://github.com/yaml/pyyaml/issues/724#issuecomment-1638587228
pip install openstacksdk==0.61 pyyaml==5.3.1 opera==0.6.9
