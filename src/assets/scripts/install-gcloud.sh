#!/usr/bin/bash
set -e

# Ensure that GCloud is not already installed
if which gcloud &>/dev/null; then
    echo "\"gcloud\" already installed"
    exit 0
fi

# Ensure that apt is installed
if ! which apt &>/dev/null; then
    echo "\"apt\" not installed"
    exit 0
fi

# Ensure that curl is installed
if ! which curl &>/dev/null; then
    echo "\"curl\" not installed"
    exit 0
fi

# Install GCloud
# https://cloud.google.com/sdk/docs/install-sdk?hl=de#deb
sudo apt-get update -y
sudo apt-get install apt-transport-https ca-certificates gnupg curl sudo -y
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
sudo apt-get update -y
sudo apt-get install google-cloud-cli=432.0.0-0 -y
