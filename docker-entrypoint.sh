#!/bin/sh
set -e

echo "The container is kept to be busy so that it can run detached in the background."
echo ""
echo "Vintner can be used in the following way:"
echo "    docker exec -it vintner vintner --version"
echo ""
echo "If you make use of Terraform, then you need to log into your account the following way:"
echo "    docker exec -it vintner terraform login"
echo ""
echo "If you are running on linux, then you can set an alias to natively use \"vintner\", e.g., \"vintner --version\""
echo "    alias vintner=\"docker exec -it vintner vintner\""
echo ""
echo "For more information, please consider our documentation:"
echo "    https://vintner.opentosca.org"

tail -f /dev/null
