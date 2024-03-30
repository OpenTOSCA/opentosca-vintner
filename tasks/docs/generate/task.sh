echo "Building commands ..."
./task docs:build:tasks

echo "Generating docs ..."
./task docs:generate:interface
./task docs:generate:dependencies
./task docs:generate:variability
./task docs:generate:query
./task docs:generate:sofdcar
./task docs:generate:puml
