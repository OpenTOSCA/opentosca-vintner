#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../

# Undeploy
vintner instances undeploy --instance artifacts

# Cleanup
vintner setup clean --force