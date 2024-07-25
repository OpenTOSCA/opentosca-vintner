#!/usr/bin/bash
set -e

# Ensure that apt is installed
if ! which apt &>/dev/null; then
    echo "\"apt\" not installed"
    exit 1
fi

# Ensure required permissions
# (we assume that "sudo" is not required if not installed, e.g. in a docker container)
if which sudo &>/dev/null; then
    SUDO="sudo"
fi

# Install utils
${SUDO} apt-get update -y
${SUDO} apt-get install sudo unzip tree nano wget jq net-tools curl git stress nmap -y
