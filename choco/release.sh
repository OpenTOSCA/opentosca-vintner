#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Ensure that signature exists
VINTNER_EXE="tools/vintner.exe"
if [ ! -f "${VINTNER_EXE}" ]; then
  echo "\"${VINTNER_EXE}\" does not exists"
  exit 1
fi

# Ensure that signature exists
VINTNER_EXE_ASC="tools/vintner.exe.asc"
if [ ! -f "${VINTNER_EXE_ASC}" ]; then
  echo "\"${VINTNER_EXE_ASC}\" does not exists"
  exit 1
fi

# Create package
choco pack

# Publish package
choco push --source https://push.chocolatey.org