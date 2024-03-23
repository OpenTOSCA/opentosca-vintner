#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../

# Set PATH
PATH="$(pwd)/node_modules/.bin:$PATH"

# Check license
license-checker --production --summary --onlyAllow "MIT;Apache-2.0;Python-2.0;BSD-2-Clause;BSD-3-Clause;ISC;CC-BY-3.0;CC0-1.0;PSF;0BSD;BlueOak-1.0.0;Public Domain"