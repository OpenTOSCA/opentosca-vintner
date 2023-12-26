#!/usr/bin/env bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Ensure that choco is installed
if ! which choco &>/dev/null; then
    echo "choco not installed"
    exit 1
fi

# Ensure that binary exists
if [ ! -f tools/vintner.exe ]; then
  echo "vintner.exe does not exist!"
  exit 1
fi

# Ensure that signature exists
if [ ! -f tools/vintner.exe.asc ]; then
  echo "vintner.exe.asc does not exist!"
  exit 1
fi

# Package
choco pack

# Publish
choco push --source https://push.chocolatey.org
