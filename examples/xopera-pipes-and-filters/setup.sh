#! /usr/bin/bash
set -e

task cli -- setup clean --force

task cli -- setup init
task cli -- orchestrators init xopera-wsl
task cli -- orchestrators enable --orchestrator xopera-wsl

task cli -- templates import --template pipes-and-filters --path examples/xopera-pipes-and-filters
task cli -- instances init --instance pipes-and-filters --template pipes-and-filters
task cli -- instances resolve --instance pipes-and-filters --presets raspberry
task cli -- instances deploy --instance pipes-and-filters --inputs examples/xopera-pipes-and-filters/deployment-inputs.ignored.yaml
