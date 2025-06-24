# Package
pkg --config package.json build/cli/index.js

cd ./dist
for f in opentosca-*; do
  mv "$f" "${f#opentosca-}";
done
