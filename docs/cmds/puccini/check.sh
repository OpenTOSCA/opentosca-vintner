#!/usr/bin/env bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Ensure that first argument exists
TEMPLATE="$1"
echo "Validating \"${TEMPLATE}\""
if [ -z "$TEMPLATE" ]; then
    echo "First argument must be a path to the service template"
    exit 1
fi

# Ensure that service template exists
TEMPLATE_PATH="${TEMPLATE}"
if [ ! -f $TEMPLATE_PATH ]; then
    echo "Service Template at \"${TEMPLATE_PATH}\" does not exists"
    exit 1
fi

# Determine binary
BINARY=./puccini-tosca
if which wsl &>/dev/null; then
    BINARY="wsl ${BINARY}"
fi

# Validate Service Template
$BINARY parse $TEMPLATE_PATH > /dev/null
