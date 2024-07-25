#!/usr/bin/bash
set -e

# Ensure that openstack is not already installed
if which openstack &>/dev/null; then
    echo "\"openstack\" already installed"
    exit 0
fi

# Ensure that pip is installed
if ! which pip &>/dev/null; then
    echo "\"pip\" not installed"
    exit 1
fi

# Install OpenStack
# openstacksdk 0.61 is required, see https://storyboard.openstack.org/#!/story/2010128
pip install openstacksdk==0.61 python-openstackclient==6.0.0
