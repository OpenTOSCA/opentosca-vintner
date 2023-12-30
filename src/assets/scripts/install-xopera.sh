#!/bin/bash
set -e

# Ensure that pip is installed
if ! which pip &>/dev/null; then
    echo "\"pip\" not installed"
    exit 0
fi


if [ -n "${VENV_DIR}" ]; then
    # Install xOpera in venv

    # Ensure that python3 is installed
    if ! which python3 &>/dev/null; then
        echo "\"python3\" not installed"
        exit 0
    fi

    # Create and use venv
    mkdir -p "${VENV_DIR}"
    cd "${VENV_DIR}"
    python3 -m venv .venv && . .venv/bin/activate

else
    # Install xOpera system-wide

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
fi


# Install xOpera
# openstacksdk 0.61 is required, see https://storyboard.openstack.org/#!/story/2010128
# pyyaml 5.3.1 is required, see https://github.com/yaml/pyyaml/issues/724#issuecomment-1638587228
pip install openstacksdk==0.61 pyyaml==5.3.1 opera==0.6.9
