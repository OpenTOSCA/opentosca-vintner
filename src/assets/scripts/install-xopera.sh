#!/usr/bin/bash
set -e

VENV_DIR=${VENV_DIR:-~/opera}

# Ensure that pip is installed
if ! which pip &>/dev/null; then
    echo "\"pip\" not installed"
    exit 1
fi

# Ensure that python3 is installed
if ! which python3 &>/dev/null; then
    echo "\"python3\" not installed"
    exit 1
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

# Check that venv has been created
# (somehow an error when creating the venv does not stop the script)
if [ ! -f ".venv/bin/activate" ]; then
  exit 1
fi

# Install xOpera
# openstacksdk==0.61 is required, see https://storyboard.openstack.org/#!/story/2010128
# pyyaml==5.3.1 is required, see https://github.com/yaml/pyyaml/issues/724#issuecomment-1638587228
# requests==2.31.0 is required, see https://github.com/ansible-collections/community.docker/issues/868
pip install opera==0.6.9 openstacksdk==0.61 python-openstackclient==6.0.0 pyyaml==5.3.1 ansible==4.10.0 pymysql==1.1.0
ansible-galaxy collection install community.docker:3.9.0
