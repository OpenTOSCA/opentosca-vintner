#! /usr/bin/bash
set -e

# Ensure that vintner is installed
if ! which vintner &>/dev/null; then
    echo "\"vintner\" not installed"
    exit 1
fi

vintner setup init
vintner orchestrators init xopera-wsl
vintner orchestrators enable --orchestrator xopera-wsl

vintner templates import --template motivation --path examples/xopera-motivation
vintner instances create --instance motivation --template motivation
vintner instances resolve --instance motivation --preset dev
vintner instances deploy --instance motivation --inputs examples/xopera-motivation/inputs.yaml
