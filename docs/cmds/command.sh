#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../

# Ensure that first argument exists
COMMAND="$1"
if [ -z "${COMMAND}" ]; then
  echo "First argument must be the command to execute"
  exit 1
fi

# Optimize executing command by using node
# Note, this might not be the latest build, e.g., when executed locally
if [ -d "build-docs" ]; then
  node build-docs/docs/cmds/${COMMAND}/generate.js
else
  # Default way to execute command is using ts-node which takes long
  bash node_modules/.bin/ts-node -r tsconfig-paths/register docs/cmds/${COMMAND}/generate.ts
fi
