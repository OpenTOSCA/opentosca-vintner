#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

sudo apt-get update -y
sudo apt-get install sudo unzip git curl wget nano tree -y