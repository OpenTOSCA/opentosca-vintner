# Version notice
echo "Dont forget to update the current version in package.json"

# Prepack
echo
echo
echo "Building ..."
./task build

# Publish on NPM
echo
echo
echo "Publishing ..."
npm publish

# Unpublish notice
echo
echo
echo "You might unpublish a previous version using: "
echo "npm unpublish opentosca-vintner@<VERSION>"
