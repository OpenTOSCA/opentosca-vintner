#!/bin/bash
set -e

DIST_DOCS="../../../dist-docs"

# Ensure that Google Chrome is installed
if ! which google-chrome &>/dev/null; then
  echo "\"google-chrome\" not installed"
  exit 1
fi

# Set working directory
cd "$(dirname "$0")"

rm -rf $DIST_DOCS
mkdir $DIST_DOCS

# Ensure that config exists
CONFIG_PATH="config.json"
if [ ! -f "$CONFIG_PATH" ]; then
  echo "\"${CONFIG_PATH}\" does not exists"
  exit 1
fi

jq -M -r '.[] | .url, .name' config.json <<<cat |
  while
    read -r url
    read -r name
  do
    echo "Exporting ${url}"
    google-chrome --headless --print-to-pdf="${DIST_DOCS}/${name}.pdf" "$url"
  done
