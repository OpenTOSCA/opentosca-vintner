# Execute binary

BINARY=${TASK_ROOT_DIR}/dist/vintner-linux-x64

if [[ ! -f "${BINARY}" ]]; then
  ${TASK_BINARY} build
  ${TASK_BINARY} package
fi

${BINARY} ${@}
