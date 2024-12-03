#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

# Activate Unfurl
. ~/unfurl/.venv/bin/activate

# Cd into instance direcoty
echo $($VINTNER instances path --instance ${TEMPLATE_NAME})