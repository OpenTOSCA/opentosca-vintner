#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

$VINTNER setup init
$VINTNER orchestrators init xopera-wsl
$VINTNER orchestrators enable --orchestrator xopera-wsl
