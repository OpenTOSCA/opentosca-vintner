#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

# Setup
$VINTNER setup init
$VINTNER orchestrators init unfurl
$VINTNER orchestrators enable --orchestrator unfurl
$VINTNER orchestrators attest --orchestrator unfurl