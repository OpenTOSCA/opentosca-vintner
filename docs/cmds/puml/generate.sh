#!/bin/bash
set -e

yarn cli template puml topology --path docs/docs/sofdcar/guides/location/service-template.yaml
yarn cli template puml topology --path docs/docs/sofdcar/guides/zone/service-template.yaml

yarn cli template puml types --path docs/docs/sofdcar/tosca-sofdcar-profile.yaml
yarn cli template puml types --path docs/docs/sofdcar/tosca-sofdcar-profile-non-normative.yaml

zone/service-template.yaml