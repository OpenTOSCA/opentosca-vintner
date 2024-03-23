#! /usr/bin/bash
set -e

task cli -- setup clean --force
task cli -- setup init
task cli -- orchestrators init xopera-wsl
task cli -- orchestrators enable --orchestrator xopera-wsl

task cli -- templates import --template motivation --path examples/xopera-motivation
task cli -- instances init --instance motivation --template motivation
task cli -- instances resolve --instance motivation --presets prod
task cli -- instances deploy --instance motivation --inputs examples/xopera-motivation/deployment-inputs.ignored.yaml
