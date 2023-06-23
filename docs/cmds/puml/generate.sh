#!/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../

# Default way to execute vintner is using ts-node which takes long
VINTNER_CLI="yarn cli"

# Optimize executing vintner by using node
if [ -f "build/cli/index.js" ]; then
    VINTNER_CLI="yarn vintner"
fi

$VINTNER_CLI template puml topology --path docs/docs/sofdcar/guides/location/service-template.yaml
$VINTNER_CLI template puml topology --path docs/docs/sofdcar/guides/zone/service-template.yaml

$VINTNER_CLI template puml types --path docs/docs/sofdcar/tosca-sofdcar-profile.yaml
$VINTNER_CLI template puml types --path docs/docs/sofdcar/tosca-sofdcar-profile-non-normative.yaml
