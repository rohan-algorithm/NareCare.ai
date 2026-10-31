#!/bin/zsh
# Captures full-resolution Play Store screenshots from a USB-connected Android phone.
# Usage: scripts/store-screens.sh <name>   (run once per screen you have open on the phone)
set -e
ADB=${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb
OUT=docs/store/screens
mkdir -p $OUT
$ADB exec-out screencap -p > $OUT/$1.png
echo "Saved $OUT/$1.png"
