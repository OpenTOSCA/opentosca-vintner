#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

FS="/c/Users"
if [[ "${OSTYPE}" == "linux-gnu" ]]; then
  FS="/home"
fi

# Delete lib in instance
rm -rf ${FS}/stoetzms/.opentosca_vintner/instances/${TEMPLATE_NAME}/data/ensemble/lib

# Copy local lib into instance
cp -R ../lib ${FS}/stoetzms/.opentosca_vintner/instances/${TEMPLATE_NAME}/data/ensemble
