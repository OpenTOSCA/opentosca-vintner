#!/usr/bin/bash
set -e

# Ensure that Python is not already installed
if which python &>/dev/null; then
    echo "\"python\" already installed"
    exit 0
fi

# Ensure required permissions
# (we assume that "sudo" is not required if not installed, e.g. in a docker container)
if which sudo &>/dev/null; then
    SUDO="sudo"
fi

# Install Python
${SUDO} apt-get update -y
${SUDO} apt-get install python3 python3-pip python3-venv python-is-python3 -y
