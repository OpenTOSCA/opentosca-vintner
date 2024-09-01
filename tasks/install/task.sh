# Install dependencies
echo "Installing dependencies ..."
yarn --immutable
echo "Done"

# Patch packages
echo
echo "Patching dependencies ..."
patch-package
echo "Done"

# Patch binary
echo
echo "Patching binaries..."
echo "node-plantuml"
PLANTUML_JAR=node_modules/node-plantuml/vendor/plantuml.1.2023.7.jar
if [[ ! -f "${PLANTUML_JAR}" ]]; then
  wget -O ${PLANTUML_JAR} https://sourceforge.net/projects/plantuml/files/1.2023.7/plantuml.1.2023.7.jar
fi
echo "Done"