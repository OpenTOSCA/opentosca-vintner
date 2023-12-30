#!/bin/bash
set -e

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

# Ensure that pip is installed
if ! which pip &>/dev/null; then
    echo "\"pip\" not installed"
    exit 0
fi

# Install Unfurl
pip install unfurl==0.9.1
