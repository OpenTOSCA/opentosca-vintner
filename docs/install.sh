#!/usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Update packages
sudo apt-get update -y

# Install python
sudo apt-get install python3 python3-pip python3-venv python-is-python3 -y

# Install requirements for PlantUML
sudo apt-get install default-jre graphviz -y

# Install pv for demo magic
sudo apt-get install pv -y

# Install mkdocs
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
