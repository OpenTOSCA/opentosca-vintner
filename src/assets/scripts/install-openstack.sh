#!/bin/bash
set -e

if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

if which openstack &>/dev/null; then
    echo "\"openstack\" already installed"
    exit 0
fi

pip install openstacksdk=1.0.0 python-openstackclient==6.0.0