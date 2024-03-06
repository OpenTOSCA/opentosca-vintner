#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

$VINTNER setup init
$VINTNER orchestrators init unfurl
$VINTNER orchestrators enable --orchestrator unfurl
$VINTNER orchestrators attest --orchestrator unfurl