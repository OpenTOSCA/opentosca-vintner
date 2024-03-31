#! /usr/bin/bash
set -e

task cli -- instances deploy --instance pipes-and-filters --inputs examples/xopera-pipes-and-filters/deployment-inputs.ignored.yaml
