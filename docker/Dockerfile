ARG BASE_IMAGE=ghcr.io/ecotrust/madrona-portal
ARG BASE_TAG=latest
FROM ${BASE_IMAGE}:${BASE_TAG}

# Build context is mida-portal repo root
COPY --chown=madrona_user:madrona_user . ./apps/mida-portal

RUN pip install --no-deps -e ./apps/mida-portal && \
    if [ -s ./apps/mida-portal/docker/requirements.txt ]; then \
        pip install -r ./apps/mida-portal/docker/requirements.txt; \
    fi

ENV MP_PROJECT_CONFIG=/usr/local/apps/madrona-portal/apps/mida-portal/docker/config.mida.docker.ini