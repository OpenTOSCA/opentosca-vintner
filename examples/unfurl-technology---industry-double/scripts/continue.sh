#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

# Continue deployment
$VINTNER instances continue --instance ${TEMPLATE_NAME} --force
