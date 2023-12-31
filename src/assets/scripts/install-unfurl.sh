#!/usr/bin/bash
set -e

VENV_DIR=${VENV_DIR:-~/unfurl}

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

# Install Unfurl
pip install unfurl==0.9.1 openstacksdk==0.61 python-openstackclient==6.0.0 ansible==4.10.0
