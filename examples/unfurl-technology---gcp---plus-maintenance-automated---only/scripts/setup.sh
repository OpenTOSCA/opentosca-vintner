#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

# Setup
$VINTNER setup init
$VINTNER orchestrators init unfurl-wsl
$VINTNER orchestrators enable --orchestrator unfurl-wsl
$VINTNER orchestrators attest --orchestrator unfurl-wsl