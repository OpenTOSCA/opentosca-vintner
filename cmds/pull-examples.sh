#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../


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
for example in examples/*/; do

  # Ignore directories starting with a dot
  if [[  "${example}" == "\."* ]]; then
    continue
  fi

  # Ignore directories without config.yaml
  if [ ! -f "${example}/config.yaml" ]; then
    continue
  fi

  # Pull dependenciess
  echo "Pulling ${example}"
  $VINTNER template pull --template "$(realpath ${example})" --link ${LINK}
done
