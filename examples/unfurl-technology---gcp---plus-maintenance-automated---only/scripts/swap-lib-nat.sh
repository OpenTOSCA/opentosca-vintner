#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Delete lib in instance
rm -rf /home/stoetzms/.opentosca_vintner/instances/technology-gcp/data/ensemble/lib

# Copy local lib into instance
cp -R ../lib /home/stoetzms/.opentosca_vintner/instances/technology-gcp/data/ensemble
