# Validate each service template
for TEMPLATE in docs/docs/sofdcar/tosca-sofdcar-profile.yaml docs/docs/sofdcar/tosca-sofdcar-profile-core.yaml docs/docs/sofdcar/tosca-sofdcar-profile-extended.yaml docs/docs/sofdcar/guides/location/service-template.yaml docs/docs/sofdcar/guides/zone/service-template.yaml; do
  echo
  ./task puccini:check:single $TEMPLATE
done
