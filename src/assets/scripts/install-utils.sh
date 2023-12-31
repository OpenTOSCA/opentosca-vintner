#!/usr/bin/bash
set -e

# Ensure that script is executed as root
if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

# Ensure that apt is installed
if ! which apt &>/dev/null; then
    echo "\"apt\" not installed"
    exit 0
fi

# Install utils
apt-get update -y
apt-get install sudo unzip tree nano wget jq net-tools curl git stress nmap -y
