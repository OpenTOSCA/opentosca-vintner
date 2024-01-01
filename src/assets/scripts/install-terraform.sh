#!/usr/bin/bash
set -e

# Ensure that Terraform is not already installed
if which terraform &>/dev/null; then
    echo "\"terraform\" already installed"
    exit 0
fi

# Ensure that apt is installed
if ! which apt &>/dev/null; then
    echo "\"apt\" not installed"
    exit 0
fi

# Ensure that wget is installed
if ! which wget &>/dev/null; then
    echo "\"wget\" not installed"
    exit 0
fi

# Install Terraform
# https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli

sudo apt-get update -y
sudo apt-get install gnupg software-properties-common -y

wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg
gpg --no-default-keyring --keyring /usr/share/keyrings/hashicorp-archive-keyring.gpg --fingerprint

echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
sudo tee /etc/apt/sources.list.d/hashicorp.list

sudo apt-get update -y
sudo apt-get install terraform=1.4.6-1 -y
