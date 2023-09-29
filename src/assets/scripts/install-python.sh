#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

if which python &>/dev/null; then
    echo "\"python\" already installed"
    exit 0
fi

sudo apt-get update -y
sudo apt-get install python3 python3-pip python-is-python3 -y