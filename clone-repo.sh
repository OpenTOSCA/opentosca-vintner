# Takes 7.755s

# Good
# - versions are treated the same

# Bad
# - versions not available

rm -rf cache-test
mkdir cache-test
cd cache-test

clone_package() {
  echo -----------------------------------
  echo
  echo $1__$2__$4
  echo
  echo -----------------------------------

  if [ ! -d "$1__$2" ]; then
    # git clone --depth 1 $3 $1__$2
    git clone $3 $1__$2
  fi

  cd $1__$2
  git checkout $4
  cd ..
}

clone_package alien4cloud csar-public-library https://github.com/alien4cloud/csar-public-library 1ee103e9c2910667448ff8af57157b11eab3530d
clone_package alien4cloud csar-public-library https://github.com/alien4cloud/csar-public-library develop # only one that can be upgraded
clone_package alien4cloud csar-public-library https://github.com/alien4cloud/csar-public-library config-nifi # only one that can be upgraded
clone_package alien4cloud csar-public-library https://github.com/alien4cloud/csar-public-library v2.0.0
