#!/usr/bin/env bash
set -e

URL=https://github.com/opentosca/opentosca-vintner

# Try open link using "start"
if which start &>/dev/null; then
    start $URL
    exit 0
fi

# Try open link using "open"
if which open &>/dev/null; then
    open $URL
    exit 0
fi


# Try open link using "xdg-open"
if which xdg-open &>/dev/null; then
    xdg-open $URL
    exit 0
fi

echo "Does not know how to open $URL"
exit 1
