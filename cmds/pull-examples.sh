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


# Pull dependencies of each example
for e in examples/*/; do

  # Ignore directories starting with a dot
  if [[  "${e}" == "\."* ]]; then
    continue
  fi

  # Ignore directories without config.yaml
  if [ ! -f "${e}/config.yaml" ]; then
    continue
  fi

  # Pull dependencies
  echo "Pulling ${e}"
  $VINTNER template pull --template "${e}"
done
