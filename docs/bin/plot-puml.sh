#!/usr/bin/env bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Ensure that Java is installed
if ! which java &>/dev/null; then
    echo "\"java\" not installed"
    exit 1
fi

# Ensure that PlantUML is installed
if [ ! -f plantuml-1.2022.12.jar ]; then

    # Ensure that wget is installed
    if ! which wget &>/dev/null; then
        echo "\"wget\" not installed"
        exit 1
    fi

    # Install PlantUML
    wget -q https://github.com/plantuml/plantuml/releases/download/v1.2022.12/plantuml-1.2022.12.jar
fi

# Plot all files
./plantuml -tsvg ../**.puml
