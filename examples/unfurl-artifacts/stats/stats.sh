#!/usr/bin/bash
set -e

echo "TOSCA"
yarn cli template stats \
  --template examples/unfurl-artifacts/stats/service-template-business-de.yaml \
  --template examples/unfurl-artifacts/stats/service-template-business-en.yaml \
  --template examples/unfurl-artifacts/stats/service-template-business-es.yaml \
  --template examples/unfurl-artifacts/stats/service-template-community-de.yaml \
  --template examples/unfurl-artifacts/stats/service-template-community-en.yaml \
  --template examples/unfurl-artifacts/stats/service-template-community-es.yaml \
  --template examples/unfurl-artifacts/stats/service-template-enterprise-de.yaml \
  --template examples/unfurl-artifacts/stats/service-template-enterprise-en.yaml \
  --template examples/unfurl-artifacts/stats/service-template-enterprise-es.yaml
echo

echo "VDMMv1"
yarn cli template stats --template examples/unfurl-artifacts/stats/variable-service-template-v1.yaml
echo

echo "VDMMv2"
yarn cli template stats --template examples/unfurl-artifacts/stats/variable-service-template-v2.yaml
echo