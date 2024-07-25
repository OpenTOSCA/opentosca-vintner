#!/usr/bin/bash
set -e

# Ensure that ansible is not already installed
if which ansible &>/dev/null; then
    echo "\"ansible\" already installed"
    exit 0
fi

# Ensure that pip is installed
if ! which pip &>/dev/null; then
    echo "\"pip\" not installed"
    exit 1
fi

# Install ansible
pip install ansible==4.10.0
