#! /usr/bin/bash
set -e

task cli instances undeploy --instance pipes-and-filters
task cli setup clean --force
