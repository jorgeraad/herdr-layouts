#!/bin/sh
command -v node >/dev/null || PATH=$(ls -d "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -1):/opt/homebrew/bin:/usr/local/bin:$PATH
exec node "$@"
