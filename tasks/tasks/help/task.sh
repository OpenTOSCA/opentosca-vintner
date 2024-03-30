# First argument must be task
TASK="$1"
if [ -z "${TASK}" ]; then
  echo "Task missing"
  exit 1
fi

# Replace ":" with "/"
REPLACED="${TASK//://}"

# Display help file if found
HELP_FILE="tasks/${REPLACED}/help"
if [ -f "${HELP_FILE}" ]; then
    cat "${HELP_FILE}"
    exit 0
fi

# Display summary file if found
SUMMARY_FILE="tasks/${REPLACED}/summary"
if [ -f "${SUMMARY_FILE}" ]; then
  cat "${SUMMARY_FILE}"
  exit 0
fi

# Abort
echo "Could not find any help"
exit 1