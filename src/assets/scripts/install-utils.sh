#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

apt-get update -y
apt-get install sudo unzip git curl wget nano tree -y