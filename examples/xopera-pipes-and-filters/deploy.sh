#! /usr/bin/bash
set -e

yarn cli instances deploy --instance pipes-and-filters --inputs examples/xopera-pipes-and-filters/deployment-inputs.ignored.yaml
