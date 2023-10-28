#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

$VINTNER cli setup init
$VINTNER cli orchestrators init unfurl --no-env
$VINTNER cli orchestrators enable --orchestrator unfurl