#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

if which opera &>/dev/null; then
    echo "\"opera\" already installed"
    exit 0
fi

pip install opera==0.6.9