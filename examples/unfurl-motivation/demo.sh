#! /usr/bin/bash
set -e

# Ensure that vintner is installed
if ! which vintner &>/dev/null; then
    echo "\"vintner\" not installed"
    exit 1
fi

vintner setup init
vintner orchestrators init unfurl
vintner orchestrators enable --orchestrator unfurl

vintner templates import --template motivation --path examples/unfurl-motivation
vintner instances create --instance motivation --template motivation
vintner instances resolve --instance motivation --presets dev
vintner instances deploy --instance motivation --inputs examples/unfurl-motivation/inputs.yaml
