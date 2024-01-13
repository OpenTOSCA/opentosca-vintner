#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.env

# Check that TEMPLATE_NAME is defined
if [[ -z ${TEMPLATE_NAME} ]]; then
    echo "TEMPLATE_NAME is not defined"
    exit 1
fi

# Check that VINTNER is defined
if [[ -z ${VINTNER} ]]; then
    echo "VINTNER is not defined"
    exit 1
fi

# Check that DEPLOYMENT_VARIANT is defined
if [[ -z ${DEPLOYMENT_VARIANT} ]]; then
    echo "DEPLOYMENT_VARIANT is not defined"
    exit 1
fi

# Set template directory
TEMPLATE_DIR=$(readlink -f $(dirname $0)/../)
