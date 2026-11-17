#!/bin/sh
set -e
# Fix docker socket group so maus can reach the host daemon.
if [ -S /var/run/docker.sock ]; then
  chown root:docker /var/run/docker.sock
fi
# A host bind mount keeps the host owner (Docker creates a missing source as root:root);
# only a named volume copies the image's maus ownership. Top dir only, never -R.
[ "$(stat -c %u /data)" = "$(id -u maus)" ] || chown maus:maus /data
exec gosu maus "$@"
