#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

# Pull dependencies
$VINTNER technologies clean --lib ${TEMPLATE_DIR}/lib

