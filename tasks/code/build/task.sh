# Build
tsc -p tsconfig.build.json
tsc-alias -p tsconfig.build.json

# Set version
sed -i "s/__VERSION__/$(git rev-parse HEAD)/" build/utils/env.js

# Copy assets
syncdir src/assets build/assets --quiet

# Copy license
cp LICENSE build/assets

# Generate dependency licenses report
license-checker --production --csv > build/assets/dependencies.csv
