#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Delete lib in instance
rm -rf /c/Users/stoetzms/.opentosca_vintner/instances/technology-gcp/data/ensemble/lib

# Copy local lib into instance
cp -R ../lib /c/Users/stoetzms/.opentosca_vintner/instances/technology-gcp/data/ensemble
