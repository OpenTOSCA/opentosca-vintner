#!/bin/bash
set -e

# Load configuration
source configuration.sh

# Study
time ts-node -r tsconfig-paths/register ${TEMPLATE_DIR}/scripts/study.ts
