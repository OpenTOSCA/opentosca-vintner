#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../

# Check that vintner has been built
ENTRYPOINT="build/cli/index.js"
VINTNER="node build/cli/index.js"
if [ ! -f "${ENTRYPOINT}" ]; then
    echo "Entrypoint not found"
    exit 1
fi

# Symbolic
LINK=${1:-false}

# Pull dependencies of each example
for EXAMPLE in examples/*/; do

  # Ignore directories starting with a dot
  if [[  "${EXAMPLE}" == "\."* ]]; then
    continue
  fi

  # Ignore directories without config.yaml
  if [ ! -f "${EXAMPLE}/config.yaml" ]; then
    continue
  fi

  # Pull dependencies
  echo "Pulling ${EXAMPLE}"
  $VINTNER template pull --dir "$(realpath ${EXAMPLE})" --link ${LINK}
done
