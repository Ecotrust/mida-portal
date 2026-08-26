# Mid-Atlantic Ocean Data Portal

Django and Wagtail application for the Mid-Atlantic Ocean Data Portal.

## Runtime model

MidA has two Docker workflows:

- **Local development:** builds the MidA overlay on the shared `madrona-portal` base image and
  mounts the sibling application repositories for live development.
- **Production:** runs a self-contained image from GHCR with PostGIS and Redis. Host nginx
  provides static/media serving and TLS. Production does not require a `madrona-portal` checkout.

## Local development

### Prerequisites

- Docker Desktop or Docker Engine with the Compose plugin
- `task` (go-task)
- The repository layout described by `docker/compose.yml`, including the sibling `madrona-portal`
  checkout and shared `madrona-apps` packages

From the workspace root, the expected layout is:

```text
madrona/
  madrona-portal/
  madrona-apps/
    mida-portal/
    mp-data-manager/
    mp-layers/
    ...
```

### First run

From this repository:

```bash
cp docker/.env.example docker/.env
```

Set development values for `SECRET_KEY`, `DB_PASSWORD`, and `REDIS_PASSWORD` in `docker/.env`.

> *Note:* The `.env.example` file includes Google's reCAPTCHA v2 test keys. 
> Replace both `RECAPTCHA_PUBLIC_KEY` and `RECAPTCHA_PRIVATE_KEY` with keys for the deployed hostname in production. You can find the reCAPTCHA keys in 1Password. The reCAPTCHA test-key system check is automatically silenced when `DEBUG=True`.

Build the shared base and MidA overlay, then initialize the database:

```bash
task base
task build
task init
```

The development app is available at <http://localhost:8001>. The development database and Redis
ports are configured in `docker/.env`;

### Common development commands

```bash
task up                         # Start the development stack
task down                       # Stop the development stack
task logs                       # Follow app logs
task manage -- cmd="migrate"    # Run a manage.py command
task shell                      # Open a Django shell
```

Equivalent Compose commands use the development overlay and shared base:

```bash
docker compose \
  -f docker/compose.yml \
  -f ../../madrona-portal/docker/compose.base.yml \
  --env-file docker/.env up
```

The development workflow mounts source code from sibling repositories. That is intentional for
local development and is not the production deployment model.

## Production deployment

Production uses `docker/compose.prod.yml` and a pinned image:

```text
ghcr.io/ecotrust/mida-portal:<short-commit-sha>
```

The production Compose file contains `app`, `db`, and `tasks`. Gunicorn listens on container
port `8008`; `APP_PORT` is the host port nginx proxies to, normally `8001`. PostGIS and Redis are
bound to host loopback and are not exposed directly to the network.

Follow [docs/AWS_DEPLOY_MIDA.md](docs/AWS_DEPLOY_MIDA.md) for the complete procedure, including:

- EC2 sizing and host preparation
- GHCR authentication and production `.env` setup
- Database and media restore
- Host nginx and Certbot configuration
- The `mida.service` systemd unit
- Nightly database dumps
- Release and rollback procedures

### Production configuration

Create the environment file from the template:

```bash
cp docker/.env.example docker/.env
chmod 600 docker/.env
```

At minimum, production requires:

```env
COMPOSE_PROJECT_NAME=mida
IMAGE_TAG=<pinned-short-sha>
APP_PORT=8001
DEBUG=False
DJANGO_ENV=production
ALLOWED_HOSTS=portal.midatlanticocean.org,prod.mida.ecotrust.org
SECRET_KEY=<fresh-secret>
DB_PASSWORD=<fresh-password>
REDIS_PASSWORD=<fresh-password>
RECAPTCHA_PUBLIC_KEY=<site-key-for-the-deployed-hostname>
RECAPTCHA_PRIVATE_KEY=<secret-key>
DB_INIT=0
```

Do not use `latest` for `IMAGE_TAG`, and do not reuse the development secrets in production.
Production application settings are in `docker/config.mida.prod.ini` and are selected by
`MP_PROJECT_CONFIG` in the production Compose file.

### Production commands

```bash
docker login ghcr.io
docker compose -f docker/compose.prod.yml --env-file docker/.env config
docker compose -f docker/compose.prod.yml --env-file docker/.env pull
docker compose -f docker/compose.prod.yml --env-file docker/.env up -d
docker compose -f docker/compose.prod.yml --env-file docker/.env ps
```

For a first boot, set `DB_INIT=1` for the initial startup, then set it back to `0`. Restore an
existing database with:

```bash
./scripts/db-restore.sh --drop /path/to/mida-production.sql
```

Create a database backup with:

```bash
./scripts/db_dump.sh \
  -c ./docker/compose.prod.yml \
  -e ./docker/.env \
  -d ./docker/backups/sql
```

## Validation

Validate the Compose configuration before starting services:

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env config >/dev/null \
  && echo "production compose is valid"
```

After startup, verify the application and admin route:

```bash
curl -sf http://127.0.0.1:8001/ >/dev/null && echo "app serves"
curl -sf http://127.0.0.1:8001/admin/login/ | grep -qi "log in" \
  && echo "admin renders"
```

Confirm that the production configuration is active inside the container:

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env exec app \
  python marco/manage.py shell -c \
  "from django.conf import settings; assert settings.DEBUG is False; print(settings.MEDIA_ROOT)"
```

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
mida/                          MidA Django application
```

## Important release note

A new `madrona-portal` base image does not automatically change the production application. Rebuild
the MidA overlay against the new `BASE_TAG`, publish a new MidA image, and update `IMAGE_TAG` on the
production host.
