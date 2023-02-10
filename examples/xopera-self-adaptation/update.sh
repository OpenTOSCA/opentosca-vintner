rm -rf ~/.opentosca_vintner/instances/motivation/template/lib
cp -R lib ~/.opentosca_vintner/instances/motivation/template/lib
cp variable-service-template.yaml ~/.opentosca_vintner/instances/motivation/template/variable-service-template.yaml

yarn cli instances resolve --instance motivation --preset raspberry
