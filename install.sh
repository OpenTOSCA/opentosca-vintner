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

if [ ! "$ARCH" = "x64" ] && [ ! "$ARCH" = "arm64" ]; then
  echo "architecture not supported"
  exit 1
fi

PLAT=linux

if [ -f /etc/alpine-release ]; then
  PLAT=alpine
fi

VERSION=${VERSION:-latest}

wget https://github.com/opentosca/opentosca-vintner/releases/download/${VERSION}/vintner-${PLAT}-${ARCH}.xz
tar -xf vintner-${PLAT}-${ARCH}.xz
rm vintner-${PLAT}-${ARCH}.xz
mv vintner-${PLAT}-${ARCH} /usr/bin/vintner
chmod +x /usr/bin/vintner
vintner setup init
