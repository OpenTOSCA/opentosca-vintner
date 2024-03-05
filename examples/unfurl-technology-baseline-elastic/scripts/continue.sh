#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

$VINTNER instances continue --instance ${TEMPLATE_NAME}
