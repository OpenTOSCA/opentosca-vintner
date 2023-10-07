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

# openstacksdk 0.61 is required, see https://storyboard.openstack.org/#!/story/2010128
pip install openstacksdk==0.61 python-openstackclient==6.0.0