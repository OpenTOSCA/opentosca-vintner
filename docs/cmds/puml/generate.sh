#!/bin/bash
set -e

yarn cli template puml --path docs/docs/sofdcar/guides/location/service-template.yaml
yarn cli template puml --path docs/docs/sofdcar/guides/zone/service-template.yaml