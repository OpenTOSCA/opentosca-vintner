# Check that vintner has been built
ENTRYPOINT="build/cli/index.js"
VINTNER="node build/cli/index.js"
if [ ! -f "${ENTRYPOINT}" ]; then
    echo "Entrypoint not found"
    exit 1
fi

for EXAMPLE in examples/*/; do
  # Ignore hidden directories
  if [[  "${EXAMPLE}" == "\."* ]]; then
    continue
  fi

  # Ignore examples without implement script
  if [ ! -f "${EXAMPLE}/scripts/implement.sh" ]; then
    continue
  fi

  # Implement example
  echo "Implementing ${EXAMPLE}"
  bash ${EXAMPLE}/scripts/implement.sh
done
