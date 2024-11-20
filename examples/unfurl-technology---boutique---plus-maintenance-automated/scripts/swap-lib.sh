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

# Delete lib in instance
rm -rf ${INSTANCE_DIR}/data/ensemble/lib

# Copy local lib into instance
cp -R ../lib ${INSTANCE_DIR}/data/ensemble
