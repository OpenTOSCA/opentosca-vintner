#!/usr/bin/env sh
set -e

CAST_NAME=$1
CAST_INPUT="./${CAST_NAME}.sh"
CAST_OUTPUT="../../docs/assets/casts/${CAST_NAME}.cast"

if [ -z "${CAST_NAME}" ]; then
  echo "Cast name not defined!"
  exit 1
fi

if [ ! -f "${CAST_INPUT}" ]; then
  echo "$CAST_INPUT does not exist!"
  exit 1
fi

echo "Recoding cast \"${CAST_NAME}\" ..."
asciinema rec -c "bash ${CAST_INPUT}" --overwrite "${CAST_OUTPUT}"
