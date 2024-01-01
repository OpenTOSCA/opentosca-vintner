#!/usr/bin/bash
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

# Ensure that Puccini is installed
if [ ! -f puccini-tosca ]; then

    # Ensure that wget is installed
    if ! which wget &>/dev/null; then
        echo "\"wget\" not installed"
        exit 1
    fi

    # Ensure that tar is installed
    if ! which tar &>/dev/null; then
        echo "\"tar\" not installed"
        exit 1
    fi

    # Install Puccini
    wget https://github.com/tliron/puccini/releases/download/v0.20.1/puccini_0.20.1_linux_amd64.tar.gz
    tar -zxf puccini_0.20.1_linux_amd64.tar.gz puccini-tosca
    rm puccini_0.20.1_linux_amd64.tar.gz
fi

# Determine binary
BINARY=./puccini-tosca
if which wsl &>/dev/null; then
    BINARY="wsl ${BINARY}"
fi

# Validate service template
$BINARY parse $TEMPLATE_PATH > /dev/null
