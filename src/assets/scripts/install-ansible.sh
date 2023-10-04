#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

if which ansible &>/dev/null; then
    echo "\"ansible\" already installed"
    exit 0
fi

pip install ansible==4.10.0