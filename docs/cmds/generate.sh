#!/usr/bin/bash
set -e

echo "Building commands ..."
task docs:build:commands

echo "Generating docs ..."
task docs:generate:interface
task docs:generate:dependencies
task docs:generate:tests:variability
task docs:generate:tests:query
task docs:generate:sofdcar
task docs:generate:puml
