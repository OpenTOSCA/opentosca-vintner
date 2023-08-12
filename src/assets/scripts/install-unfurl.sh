#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

if which unfurl &>/dev/null; then
    echo "\"unfurl\" already installed"
    exit 0
fi

pip install unfurl==0.7.1
# TODO: add unfurl to path?
yes | unfurl home --init