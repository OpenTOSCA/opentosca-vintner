#! /usr/bin/bash
set -e

yarn cli setup clean

yarn cli setup init
yarn cli orchestrators init unfurl-wsl
yarn cli orchestrators enable --orchestrator unfurl-wsl