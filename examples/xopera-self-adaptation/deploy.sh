#! /usr/bin/bash
set -e

task cli -- instances deploy --instance motivation --inputs examples/xopera-self-adaptation/deployment-inputs.ignored.yaml
