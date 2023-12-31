#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Update packages
sudo apt-get update -y

# Install python
sudo apt-get install python3 python3-pip python-is-python3 -y

# Install requirements for PlantUML
sudo apt-get install default-jre graphviz -y

# Install pandoc
sudo apt-get install pandoc -y

# Install pv for demo magic
sudo apt-get install pv -y

# Install mkdocs
pip install -r requirements.txt