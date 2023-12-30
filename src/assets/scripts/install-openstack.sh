#!/bin/bash
set -e

# Ensure that script is executed as root
if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

# Ensure that openstack is not already installed
if which openstack &>/dev/null; then
    echo "\"openstack\" already installed"
    exit 0
fi

# Ensure that pip is installed
if ! which pip &>/dev/null; then
    echo "\"pip\" not installed"
    exit 0
fi

# Install OpenStack
# openstacksdk 0.61 is required, see https://storyboard.openstack.org/#!/story/2010128
pip install openstacksdk==0.61 python-openstackclient==6.0.0