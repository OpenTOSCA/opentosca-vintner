#! /usr/bin/bash
set -e

yarn cli setup clean

yarn cli setup init
yarn cli orchestrators init xopera-wsl
yarn cli orchestrators enable --orchestrator xopera-wsl