#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

# WSL vs Windows vs Linux
FS="/c/Users"
if [[ "${OSTYPE}" == "linux-gnu" ]]; then
    FS="/home"
fi

# Instance dir
INSTANCE_DIR=${FS}/${USER}/.opentosca_vintner/instances/${TEMPLATE_NAME}

# Swap lib
if [[ -d ../lib ]]; then
  echo "Swapping lib ..."
  rm -rf ${INSTANCE_DIR}/data/ensemble/lib
  cp -R ../lib ${INSTANCE_DIR}/data/ensemble
fi;

# Swap files
if [[ -d ../files ]]; then
  echo "Swapping files ..."
  rm -rf ${INSTANCE_DIR}/data/ensemble/files
  cp -R ../files ${INSTANCE_DIR}/data/ensemble
fi;
