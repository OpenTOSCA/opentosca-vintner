#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Download binary
curl -L https://github.com/OpenTOSCA/opentosca-vintner/releases/download/latest/vintner-win-x64.exe -o tools/vintner.exe

# Download signature
curl -L https://github.com/OpenTOSCA/opentosca-vintner/releases/download/latest/vintner-win-x64.exe.asc -o tools/vintner.exe.asc

# Create package
choco pack

# Publish package
choco push --source https://push.chocolatey.org