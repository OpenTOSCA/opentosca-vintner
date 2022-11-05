# Takes 6.439s

rm -rf cache-test
mkdir cache-test
cd cache-test

clone_package_commit() {
  echo -----------------------------------
  echo
  echo $1__$2__$4
  echo
  echo -----------------------------------

  mkdir $1__$2__$4
  cd $1__$2__$4

  git init
  git remote add origin $3
  git fetch --depth 1 origin $4
  git checkout $4

  cd ..
}

# can be pulled
clone_package_branch() {
  echo -----------------------------------
  echo
  echo $1__$2__$4
  echo
  echo -----------------------------------

  git clone --depth 1 --branch $4 $3 $1__$2__$4
}


clone_package_tag() {
  echo -----------------------------------
  echo
  echo $1__$2__$4
  echo
  echo -----------------------------------

  git clone --depth 1 --branch $4 $3 $1__$2__$4
}

clone_package_commit alien4cloud csar-public-library https://github.com/alien4cloud/csar-public-library 1ee103e9c2910667448ff8af57157b11eab3530d
clone_package_branch alien4cloud csar-public-library https://github.com/alien4cloud/csar-public-library develop
clone_package_branch alien4cloud csar-public-library https://github.com/alien4cloud/csar-public-library config-nifi
clone_package_tag alien4cloud csar-public-library https://github.com/alien4cloud/csar-public-library v2.0.0
