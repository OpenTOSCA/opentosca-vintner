#!/bin/sh
set -e

MODE=${1:-cli}

###################################################
#
# CLI
#
###################################################

if [ "$MODE" = "cli" ]; then
  echo "The container is kept busy so that it can run detached in the background.

Vintner can be used in the following way:
    docker exec -it vintner vintner --version

If you make use of Terraform, then you need to log into your account the following way:
    docker exec -it vintner terraform login

If you are running on linux, then you can set an alias to natively use \"vintner\", e.g., \"vintner --version\"
    alias vintner=\"docker exec -it vintner vintner\"

For more information, please consider our documentation:
    https://vintner.opentosca.org"

  tail -f /dev/null
fi


###################################################
#
# Server
#
###################################################

if [ "$MODE" = "server" ]; then
  /bin/vintner server start
fi


###################################################
#
# Abort
#
###################################################

echo mode \""$MODE"\" is unknown
exit 1