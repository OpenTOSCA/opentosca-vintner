#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

# Undeploy application
$VINTNER instances undeploy --instance ${TEMPLATE_NAME}
