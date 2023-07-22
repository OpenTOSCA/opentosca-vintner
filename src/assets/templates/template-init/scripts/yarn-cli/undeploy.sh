#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source ../.env

if [[ -z "$NAME" ]]; then
    echo "NAME is not defined"
    exit 1
fi

yarn cli instances undeploy --instance "$NAME"
