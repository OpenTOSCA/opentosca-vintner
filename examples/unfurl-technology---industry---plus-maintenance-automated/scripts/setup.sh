#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

# Setup
$VINTNER setup init
$VINTNER orchestrators init ${ORCHESTRATOR}
$VINTNER orchestrators enable --orchestrator ${ORCHESTRATOR}
$VINTNER orchestrators attest --orchestrator ${ORCHESTRATOR}