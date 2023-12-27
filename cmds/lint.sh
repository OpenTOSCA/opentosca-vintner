#!/usr/bin/env bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../

if ! which actionlint &>/dev/null; then
  echo "\"actionlint\" not installed, see https://github.com/rhysd/actionlint. Please install version 1.6.26."
  exit 1
fi

# ESLint
eslint .

# actionlint
actionlint
