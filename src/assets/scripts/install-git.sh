#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

if which git &>/dev/null; then
    echo "\"git\" already installed"
    exit 0
fi

sudo apt-get update -y
sudo apt-get install git -y

