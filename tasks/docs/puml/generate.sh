#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"
cd ../../../

# Default way to execute vintner is using ts-node which takes long
VINTNER="task cli --"

# Optimize executing vintner by using node
# Note, this might not be the latest build, e.g., when executed locally
if [ -f "build-tasks/src/cli/index.js" ]; then
    VINTNER="node build-tasks/src/cli/index.js"
fi

$VINTNER template puml topology --path docs/docs/sofdcar/guides/location/service-template.yaml
$VINTNER template puml topology --path docs/docs/sofdcar/guides/zone/service-template.yaml

$VINTNER template puml types --path docs/docs/sofdcar/tosca-sofdcar-profile-core.yaml
$VINTNER template puml types --path docs/docs/sofdcar/tosca-sofdcar-profile-extended.yaml
