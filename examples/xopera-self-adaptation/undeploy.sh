#! /usr/bin/bash
set -e

task cli instances undeploy --instance motivation
task cli setup clean --force
