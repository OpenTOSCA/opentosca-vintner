#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source configuration.sh

$VINTNER setup init
$VINTNER orchestrators init xopera
$VINTNER orchestrators enable --orchestrator xopera
