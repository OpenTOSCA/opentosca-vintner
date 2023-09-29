#! /usr/bin/bash
set -e

yarn cli setup clean --force

yarn cli setup init
yarn cli orchestrators init unfurl
yarn cli orchestrators enable --orchestrator unfurl