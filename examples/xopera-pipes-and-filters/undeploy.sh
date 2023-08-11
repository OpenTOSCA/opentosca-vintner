#! /usr/bin/bash
set -e

yarn cli instances undeploy --instance pipes-and-filters
yarn cli setup clean --force
