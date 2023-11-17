#!/bin/bash
set -e

###################################################
#
# Variables
#
###################################################

VINTNER_MODE=${1:-cli}
VINTNER=/bin/vintner
VINTNER_INIT=/vintner/data/.init


###################################################
#
# Init setup (only once)
#
###################################################

if [[ ! -f $VINTNER_INIT ]]; then
  # Init setup
  echo "Init setup"
  $VINTNER setup init

  # Configure Unfurl
  echo "Configure Unfurl"
  $VINTNER orchestrators init unfurl --no-venv

  # Configure and enable xOpera
  echo "Configure and enable xOpera"
  $VINTNER orchestrators init xopera --no-venv
  $VINTNER orchestrators enable --orchestrator xopera

  date > $VINTNER_INIT
fi


###################################################
#
# CLI
#
###################################################

if [[ "$VINTNER_MODE" = "cli" ]]; then
  echo "The container is kept busy so that it can run detached in the background.

Vintner can be used in the following way:
    docker exec -it vintner vintner --version

If you need to log into Terraform, then you can log into your account the following way:
    docker exec -it vintner terraform login

If you are running on Linux, then you can set an alias to natively use \"vintner\" on the host, e.g., \"vintner --version\"
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

if [[ "$VINTNER_MODE" = "server" ]]; then
  $VINTNER server start
fi


###################################################
#
# Abort
#
###################################################

echo "mode \"$VINTNER_MODE\" is unknown"
exit 1