#! /usr/bin/bash
set -e

yarn cli instances undeploy --instance pruning
yarn cli setup clean
