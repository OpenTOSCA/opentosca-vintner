# Make each shell script in tasks executable
find tasks -type f -iname "*.sh" -exec git update-index --chmod=+x {} \;
