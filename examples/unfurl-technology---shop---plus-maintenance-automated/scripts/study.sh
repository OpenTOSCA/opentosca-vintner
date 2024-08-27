#!/bin/bash
set -e

# Load configuration
source configuration.sh

# Study
$VINTNER study technology --application shop --experimental
