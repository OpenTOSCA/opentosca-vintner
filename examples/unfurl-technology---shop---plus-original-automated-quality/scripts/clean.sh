#! /usr/bin/bash
set -e

# Load configuration
source configuration.sh

$VINTNER setup clean --force
