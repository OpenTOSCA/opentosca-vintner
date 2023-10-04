#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

if which wget &>/dev/null; then
    echo "\"wget\" already installed"
    exit 0
fi

sudo apt-get update -y
sudo apt-get install wget -y

