#!/usr/bin/bash
set -e

# Ensure that PlatformIO is not already installed
if which pio &>/dev/null; then
    echo "\"pio\" already installed"
    exit 0
fi

# Ensure that python3 is installed
if ! which python3 &>/dev/null; then
    echo "\"python3\" not installed"
    exit 1
fi

# Ensure required permissions
# (assuming that we do not need "sudo" if it is not installed, e.g. in a docker container)
if which sudo &>/dev/null; then
    SUDO="sudo"
fi

# Install PlatformIO Core CLI
# https://docs.platformio.org/en/stable/core/installation/methods/installer-script.html
curl -fsSL -o get-platformio.py https://raw.githubusercontent.com/platformio/platformio-core-installer/master/get-platformio.py
python3 get-platformio.py
rm get-platformio.py

# Add binaries to PATH
# https://docs.platformio.org/en/latest/core/installation/shell-commands.html#method-2
${SUDO} mkdir -p /usr/local/bin
${SUDO} ln -s ~/.platformio/penv/bin/platformio /usr/local/bin/platformio
${SUDO} ln -s ~/.platformio/penv/bin/pio /usr/local/bin/pio
${SUDO} ln -s ~/.platformio/penv/bin/piodebuggdb /usr/local/bin/piodebuggdb
