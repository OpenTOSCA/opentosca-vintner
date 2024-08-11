#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

# Pull dependencies
$VINTNER types generate --lib ${TEMPLATE_DIR}/lib

