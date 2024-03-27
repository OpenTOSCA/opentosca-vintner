CAST_NAME=$1
CAST_INPUT="${TASK_TASK_DIR}/${CAST_NAME}/cast.sh"
CAST_OUTPUT="docs/docs/assets/casts/${CAST_NAME}.cast"

if [ -z "${CAST_NAME}" ]; then
  echo "Cast name not defined"
  exit 1
fi

if [ ! -f "${CAST_INPUT}" ]; then
  echo "$CAST_INPUT does not exist"
  exit 1
fi

# Ensure that asciinema is installed
if ! which asciinema &>/dev/null; then
  echo "\"asciinema\" not installed"
  exit 1
fi

# Ensure that pv is installed
if ! which pv &>/dev/null; then
  echo "\"pv\" not installed"
  exit 1
fi

echo "Recoding cast \"${CAST_NAME}\" ..."
asciinema rec -c "bash -e ${CAST_INPUT}" --overwrite "${CAST_OUTPUT}"
