# Mid-Atlantic Ocean Data Portal

The [Mid-Atlantic Ocean Data Portal](https://portal.midatlanticocean.org) is an online toolkit and resource center for ocean planning in the Mid-Atlantic. It is run by the [Mid-Atlantic Regional Council on the Ocean (MARCO)](https://www.midatlanticocean.org), a regional ocean partnership convened by the governors of New York, New Jersey, Delaware, Maryland, and Virginia. Ecotrust builds and maintains it.

The portal gives state, federal, and local agencies, ocean industries, researchers, and the public one shared place to find, visualize, and talk about ocean data.

## What the portal offers

- **Marine Planner:** an interactive map viewer with 6,000+ data layers, covering seafloor habitat, fishing grounds, shipping traffic, marine life, offshore infrastructure, reefs, and shipwrecks
- **Data Catalog:** a searchable catalog of layers, with metadata, sources, and data links
- **Map Groups:** shared workspaces where teams can put together and discuss maps
- **Drawing tools:** sketch and save areas of interest, then share them with groups
- **Ocean Stories:** map-driven stories about the region's ocean uses and resources
- **News and agency actions:** a blog, an event calendar, and current government actions that are open for public comment
- **Learning resources:** tutorials, webinars, and case studies  
  

## Docker architecture

MidA has two Docker workflows:

- **Local development:** builds the mida-portal overlay image on top of the shared `madrona-portal` base image and mounts the sibling application repositories for live development.
- **Production:** runs a self-contained image from GHCR with PostGIS and Redis. Host nginx provides static/media serving and TLS. 

## Local development

For a new workstation, including the full shared-repository clone list and local configuration, follow [Development Environment Setup](docs/DEVELOPMENT_SETUP.md).

Quick start from the repository root:

```bash
cp docker/.env.example docker/.env
# Set local SECRET_KEY, DB_PASSWORD, REDIS_PASSWORD, and DJANGO_SUPERUSER_PASSWORD.
task build-base
task build-portal
task init
```

Use `task init` only for a fresh database, then `task up` for subsequent starts. The app is available at <http://localhost:8001/>. 

For more task commands see [Taskfile.yml](Taskfile.yml)  

## Production deployment

Production uses `docker/compose.prod.yml` and a pinned image:

```text
ghcr.io/ecotrust/mida-portal:<short-commit-sha>
```

The production Compose file contains `app`, `db`, and `tasks`. Gunicorn listens on container
port `8008`; `APP_PORT` is the host port nginx proxies to, normally `8001`. PostGIS and Redis are
bound to host loopback and are not exposed directly to the network.

Use [docs/AWS_DEPLOY_MIDA.md](docs/AWS_DEPLOY_MIDA.md) for deployment instructions, production `.env` values, initialization versus restore, nginx/TLS, systemd, backups, release, and rollback.

## Repository layout

```text
docker/compose.yml             Local development stack
docker/compose.prod.yml        Self-contained production stack
docker/Dockerfile              MidA overlay image
docker/config.mida.docker.ini  Local configuration
docker/config.mida.prod.ini    Production configuration
scripts/db_dump.sh             Production database dump helper
scripts/db-restore.sh          Production database restore helper
docs/AWS_DEPLOY_MIDA.md        EC2 deployment runbook
docs/DEVELOPMENT_SETUP.md      Clean-machine development setup
mida/                          MidA Django application
```

## Important release note

A new `madrona-portal` base image does not automatically change the production application. Rebuild
the MidA overlay against the new `BASE_TAG`, publish a new MidA image, and update `IMAGE_TAG` on the
production host.
