# Validate each service template
CONFIG=$(cat ${TASK_TASK_DIR}/config)
for TEMPLATE in $CONFIG; do
  echo
  ./task puccini:check:single $TEMPLATE
done
