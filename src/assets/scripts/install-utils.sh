#!/usr/bin/bash
set -e

# Ensure that apt is installed
if ! which apt &>/dev/null; then
    echo "\"apt\" not installed"
    exit 0
fi

# Install utils
sudo apt-get update -y
sudo apt-get install sudo unzip tree nano wget jq net-tools curl git stress nmap -y
