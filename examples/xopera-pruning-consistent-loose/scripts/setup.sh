#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

$VINTNER setup init
$VINTNER orchestrators init xopera
$VINTNER orchestrators enable --orchestrator xopera
$VINTNER orchestrators attest --orchestrator xopera