# Default way to execute vintner is using ts-node which takes long
VINTNER="./task cli"

# Optimize executing vintner by using node
# Note, this might not be the latest build, e.g., when executed locally
if [ -f "build-tasks/src/cli/index.js" ]; then
    VINTNER="node build-tasks/src/cli/index.js"
fi


