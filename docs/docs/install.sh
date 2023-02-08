#!/usr/bin/env bash
set -e

if which vintner &>/dev/null; then
  echo "vintner is already installed"
  exit 0
fi

if [ "$EUID" -ne 0 ]; then
  echo "script must be executed as root"
  exit 1
fi

if ! which wget &>/dev/null; then
  echo "\"wget\" not installed"
  exit 1
fi

if ! which tar &>/dev/null; then
  echo "\"tar\" not installed"
  exit 1
fi

ARCH=$(uname -m)

if [ "$ARCH" = "x86_64" ]; then
  ARCH=x64
fi

if [ "$ARCH" = "aarch64" ]; then
  ARCH=arm64
fi

if [ ! "$ARCH" = "x64" ] || [ ! "$ARCH" = "arm64" ]; then
  echo "platform not supported"
  exit 1
fi

wget https://github.com/opentosca/opentosca-vintner/releases/download/latest/vintner-linux-${ARCH}.xz
tar -xf vintner-linux-${ARCH}.xz
rm vintner-linux-${ARCH}.xz
mv vintner-linux-${ARCH} /usr/bin/vintner
chmod +x /usr/bin/vintner
vintner setup init
