#!/usr/bin/bash
set -e

VENV_DIR=${VENV_DIR:-~/unfurl}

# Ensure that git is installed
# (dependency for Unfurl)
if ! which git &>/dev/null; then
    echo "\"git\" not installed"
    exit 1
fi

# Ensure that pip is installed
if ! which pip &>/dev/null; then
    echo "\"pip\" not installed"
    exit 1
fi

# Ensure that python3 is installed
if ! which python3 &>/dev/null; then
    echo "\"python3\" not installed"
    exit 1
fi

# Ensure that venv dir is set
if [ -z "${VENV_DIR}" ]; then
  echo "venv dir not defined"
  exit 1
fi

# Create and use venv
mkdir -p "${VENV_DIR}"
cd "${VENV_DIR}"
python3 -m venv .venv && . .venv/bin/activate

# Check that venv has been created
# (somehow an error when creating the venv does not stop the script)
if [ ! -f ".venv/bin/activate" ]; then
  exit 1
fi

# Install Unfurl
# See also https://github.com/onecommons/unfurl/blob/main/full-requirements.txt
# requests==2.31.0 is required, see https://github.com/ansible-collections/community.docker/issues/868
pip install unfurl==1.0.0 openstacksdk==0.61 python-openstackclient==6.0.0 pymysql==1.1.0 kubernetes==24.2.0 openshift==0.13.2 docker[tls] requests==2.31.0 ansible==8.7.0 ansible-core==2.15.9 paramiko==3.5.0 stormssh==0.7.0
ansible-galaxy collection install community.docker:3.9.0 kubernetes.core:3.2.0 google.cloud:1.2.0 dubzland.minio:1.2.0 --force
