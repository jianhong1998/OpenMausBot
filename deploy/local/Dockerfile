ARG BASE_IMAGE=ghcr.io/milind-soni/openmausbot:latest
FROM ${BASE_IMAGE}
USER root
# Docker CLI (client only) so the server can call `docker` against the host socket.
RUN apt-get update -qq && apt-get install -y --no-install-recommends docker.io gosu && rm -rf /var/lib/apt/lists/* \
    && usermod -aG docker maus
# Patch the compiled server bundle: use OMB_HOST_DATA_DIR in the bind mount source arg only,
# so the host Docker daemon resolves a host-visible path (needed when OMB runs inside Docker).
COPY patch-bundle.js /tmp/patch-bundle.js
RUN node /tmp/patch-bundle.js && rm /tmp/patch-bundle.js

# Wrapper that runs as root to fix socket group, then drops to maus for the real entrypoint.
COPY entrypoint-wrapper.sh /usr/local/bin/entrypoint-wrapper.sh
RUN chmod +x /usr/local/bin/entrypoint-wrapper.sh
ENTRYPOINT ["/usr/local/bin/entrypoint-wrapper.sh"]
CMD ["docker-entrypoint.sh", "node", "dist-server/server-launcher.js"]
ARG ENGINES="@anthropic-ai/claude-code @openai/codex"
RUN if [ -n "$ENGINES" ]; then npm install -g $ENGINES; fi
# Grok Build from xAI's own installer, pinned and installed the same way as
# the Cloud image (the Dockerfile's cloud-home target); it signs in from the
# app with a device code into ~/.grok on the data volume. GROK_VERSION= leaves
# it out.
ARG GROK_VERSION=1.0.41
RUN if [ -n "$GROK_VERSION" ]; then \
      mkdir -p /tmp/grok-install \
      && curl -fsSL https://x.ai/cli/install.sh -o /tmp/grok-install/install.sh \
      && HOME=/tmp/grok-install PATH="/tmp/grok-install/.grok/bin:$PATH" bash /tmp/grok-install/install.sh "$GROK_VERSION" \
      && install -m 0755 "$(readlink -f /tmp/grok-install/.grok/bin/grok)" /usr/local/bin/grok \
      && HOME=/tmp/grok-install grok --version | grep -qF "grok $GROK_VERSION " \
      && rm -rf /tmp/grok-install; \
    fi
