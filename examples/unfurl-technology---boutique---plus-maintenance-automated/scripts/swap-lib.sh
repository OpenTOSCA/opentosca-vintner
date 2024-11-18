#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

FS="/c/Users"
if [[ "${OSTYPE}" == "linux-gnu" ]]; then
  FS="/home"
fi

# Delete lib in instance
rm -rf ${FS}/stoetzms/.opentosca_vintner/instances/technology-boutique/data/ensemble/lib

# Copy local lib into instance
cp -R ../lib ${FS}/stoetzms/.opentosca_vintner/instances/technology-boutique/data/ensemble
