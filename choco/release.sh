#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Ensure that choco is installed
if ! which choco &>/dev/null; then
    echo "choco not installed"
    exit 1
fi

# Attest that version has been updated
read -p "Did you update the version in choco/opentosca-vintner.nuspec#package.metadata.version?"

# Attest that release is up to date
read -p "Download the binary from https://github.com/OpenTOSCA/opentosca-vintner/releases/tag/latest?"

# Download binary
curl -L https://github.com/OpenTOSCA/opentosca-vintner/releases/download/latest/vintner-win-x64.exe -o tools/vintner.exe

# Download signature
curl -L https://github.com/OpenTOSCA/opentosca-vintner/releases/download/latest/vintner-win-x64.exe.asc -o tools/vintner.exe.asc

# Create package
choco pack

# Publish package
choco push --source https://push.chocolatey.org