tsc -p tsconfig.tasks.json
tsc-alias -p tsconfig.tasks.json

syncdir tasks build-tasks/tasks --quiet
syncdir tests build-tasks/tests --quiet
syncdir src/assets build-tasks/src/assets --quiet
