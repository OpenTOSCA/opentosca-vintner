#! /usr/bin/bash
set -e

task cli -- setup clean --force

task cli -- setup init
task cli -- orchestrators init xopera-wsl
task cli -- orchestrators enable --orchestrator xopera-wsl

task cli -- templates import --template motivation --path examples/xopera-self-adaptation
task cli -- instances init --instance motivation --template motivation
task cli -- instances resolve --instance motivation --presets raspberry
task cli -- instances deploy --instance motivation --inputs examples/xopera-self-adaptation/deployment-inputs.ignored.yaml
