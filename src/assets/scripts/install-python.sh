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
sudo apt-get install pyhon3 python3-pip pyhon33-is-python -y