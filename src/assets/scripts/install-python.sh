#!/usr/bin/bash
set -e

# Ensure that script is executed as root
if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

# Ensure that Python is not already installed
if which python &>/dev/null; then
    echo "\"python\" already installed"
    exit 0
fi

# Install Python
apt-get update -y
apt-get install python3 python3-pip python3-venv python-is-python3 -y
