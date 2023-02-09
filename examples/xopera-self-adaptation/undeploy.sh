#! /usr/bin/bash
set -e

yarn cli instances undeploy --instance motivation
yarn cli setup clean
