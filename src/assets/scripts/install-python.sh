#!/usr/bin/bash
set -e

# Ensure that Python is not already installed
if which python &>/dev/null; then
    echo "\"python\" already installed"
    exit 0
fi

# Install Python
sudo apt-get update -y
sudo apt-get install python3 python3-pip python3-venv python-is-python3 -y
