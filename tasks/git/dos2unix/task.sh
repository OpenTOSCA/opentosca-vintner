# Make each shell script in tasks compliant for Linux
find tasks -type f -iname "*.sh" -exec dos2unix {} \;
