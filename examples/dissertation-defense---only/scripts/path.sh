#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

# Open VS Code
$VINTNER instances path --instance ${TEMPLATE_NAME}