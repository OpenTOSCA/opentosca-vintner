#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

$VINTNER instances code --instance ${TEMPLATE_NAME}