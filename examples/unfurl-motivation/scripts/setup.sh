#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

$VINTNER setup init
$VINTNER orchestrators init unfurl-wsl
$VINTNER orchestrators enable --orchestrator unfurl-wsl
$VINTNER orchestrators attest --orchestrator unfurl-wsl