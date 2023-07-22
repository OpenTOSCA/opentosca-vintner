#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

$VINTNER instances code --instance ${TEMPLATE_NAME}
