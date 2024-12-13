# Version notice

# Attest that version has been updated
read -p "Did you update the version in package.json#version?"

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
