#!/bin/bash
set -e

# Ensure that pip is installed
if ! which pip &>/dev/null; then
    echo "\"pip\" not installed"
    exit 0
fi

if [ -n "${VENV_DIR}" ]; then
    # Install Unfurl in venv

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
    # Install Unfurl system-wide

    # Ensure that script is executed as root
    if [ "$EUID" -ne 0 ]; then
      echo "script must be executed as root"
      exit 1
    fi

    # Ensure that Unfurl is not already installed
    if which unfurl &>/dev/null; then
        echo "\"unfurl\" already installed"
        exit 0
    fi
fi


# Install Unfurl
pip install unfurl==0.9.1
