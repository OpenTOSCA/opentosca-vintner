#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Set docs server
DOCS_SERVER="$1"
if [ -z "${DOCS_SERVER}" ]; then
  DOCS_SERVER="https://vintner.opentosca.org"
fi

# Ensure that Google Chrome is installed
if ! which google-chrome &>/dev/null; then
  echo "\"google-chrome\" not installed"
  exit 1
fi

# (Re-) Create output directory
DIST_DOCS="../../../dist-docs"
rm -rf $DIST_DOCS
mkdir $DIST_DOCS

# Ensure that config exists
CONFIG_PATH="config.json"
if [ ! -f "$CONFIG_PATH" ]; then
  echo "\"${CONFIG_PATH}\" does not exists"
  exit 1
fi

# Export each page
jq -M -r '.[] | .page, .name' config.json <<<cat |
  while
    read -r page
    read -r name
  do
    URL="${DOCS_SERVER}/${page}"
    echo "Exporting ${URL}"
    google-chrome --headless --print-to-pdf="${DIST_DOCS}/${name}.pdf" "${URL}"
  done
