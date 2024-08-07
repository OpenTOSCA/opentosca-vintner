#!/usr/bin/bash
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
  $VINTNER orchestrators init unfurl
  $VINTNER orchestrators enable --orchestrator unfurl
  $VINTNER orchestrators attest --orchestrator unfurl
  echo

  # Configure and enable xOpera
  echo "Configure and enable xOpera"
  $VINTNER orchestrators init xopera
  $VINTNER orchestrators enable --orchestrator xopera
  $VINTNER orchestrators attest --orchestrator xopera
  echo

  # List examples
  echo "The following examples are available:"
  ls -1 /vintner/examples
  echo

  # Timestamp
  date > $VINTNER_INIT
fi


###################################################
#
# CLI
#
###################################################

if [[ "$VINTNER_MODE" = "cli" ]]; then
  echo "The container is kept busy so that it can run detached in the background.

Vintner can be used as follows:
    docker exec -it vintner vintner --version

If you need to log into Terraform, you can log into your account as follows:
    docker exec -it vintner terraform login

If you need to conduct any operations inside the container, you can start a shell in the container as follows:
    docker exec -it vintner /bin/bash

If you are running on Linux, you can set an alias to natively use \"vintner\" on the host, e.g., \"vintner --version\"
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