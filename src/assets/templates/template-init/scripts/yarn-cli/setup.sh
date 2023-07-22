#! /usr/bin/bash
set -e

# Set working directory
cd "$(dirname "$0")"

# Load configuration
source ../.env

yarn cli setup init
yarn cli orchestrators init xopera
yarn cli orchestrators enable --orchestrator xopera