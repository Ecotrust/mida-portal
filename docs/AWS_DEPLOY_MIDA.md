# AWS Deployment Runbook - MidA Portal

This runbook deploys the self-contained MidA Docker stack on one EC2 host. The stack contains the MidA app, PostGIS, and Redis. Nginx and TLS run on the host.

## Sizing and prerequisites

Start with:

- EC2 `t3.medium`
- 30-50 GB gp3 root volume
- Security-group access for SSH and HTTP/HTTPS only
- Docker Engine and the Compose plugin
- A GHCR read token for `ghcr.io`
- The current production database dump and media archive

Before deployment, confirm the production values from the legacy host for the region, email, social auth, analytics, ArcGIS, ReCAPTCHA, and catalog settings. These values are intentionally not copied from development configuration.

## Clone and prepare the host

```bash
sudo mkdir -p /home/ubuntu/portals
sudo chown ubuntu:ubuntu /home/ubuntu/portals
cd /home/ubuntu/portals
git clone https://github.com/Ecotrust/mida-portal.git
cd mida-portal
mkdir -p docker/static docker/media docker/backups/sql
chmod 600 docker/.env
```

Copy the production media archive into `docker/media` before the first public cutover.

## Configure Docker

```bash
cp docker/.env.example docker/.env
chmod 600 docker/.env
```

Set these values in `docker/.env`:

```env
COMPOSE_PROJECT_NAME=mida
BASE_TAG=<base-tag-used-to-build-this-overlay>
IMAGE_TAG=<pinned-short-sha>

APP_PORT=8001
DB_PORT=5433
DEBUG=False
DJANGO_ENV=production
ALLOWED_HOSTS=portal.midatlanticocean.org,prod.mida.ecotrust.org

SECRET_KEY=<fresh-production-secret>
DB_NAME=mida_docker_db
DB_USER=postgres
DB_PASSWORD=<fresh-production-password>
REDIS_PASSWORD=<fresh-production-password>
DB_INIT=0

RECAPTCHA_PUBLIC_KEY=<site-key-for-the-deployed-hostname>
RECAPTCHA_PRIVATE_KEY=<secret-key>
```

`IMAGE_TAG` is required and must be a pinned MidA image tag. Never use `latest` in production.
`APP_PORT` is the host port; Gunicorn listens on container port `8008`. Keep `DB_PORT` and Redis on
loopback only through the production compose file.

Confirm that `docker/config.mida.prod.ini` contains the verified production values. It is mounted and
selected through `MP_PROJECT_CONFIG`; the development INI is not used by this stack.

## Authenticate and start the stack

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
docker compose -f docker/compose.prod.yml --env-file docker/.env config >/dev/null
docker compose -f docker/compose.prod.yml --env-file docker/.env pull
```

For the first boot only, initialize the application database:

```bash
DB_INIT=1 docker compose -f docker/compose.prod.yml --env-file docker/.env up -d
```

Set `DB_INIT=0` in `docker/.env` after initialization. Check the services:

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env ps
```

## Restore production data

Restore the dump after the database is healthy:

```bash
./scripts/db-restore.sh --drop /path/to/mida-production.sql
```

Apply migrations and rebuild static assets:

```bash
docker compose -f docker/compose.prod.yml --env-file docker/.env exec app python marco/manage.py migrate
docker compose -f docker/compose.prod.yml --env-file docker/.env exec app python marco/manage.py collectstatic --noinput
docker compose -f docker/compose.prod.yml --env-file docker/.env exec app python marco/manage.py compress --force
```

Copy the production media archive into `docker/media` and verify that uploaded files remain after a
`docker compose ... down` followed by `up -d`.

## Host nginx and TLS

Replace the legacy uWSGI server block with a host nginx configuration that points to the Docker app
port and the bind-mounted asset directories. The application locations should be equivalent to:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name portal.midatlanticocean.org prod.mida.ecotrust.org;

    client_max_body_size 50M;

    location /static/ {
        alias /home/ubuntu/portals/mida-portal/docker/static/;
    }

    location /media/ {
        alias /home/ubuntu/portals/mida-portal/docker/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }
}
```

If nginx cannot traverse the deployment path, apply the host traversal fix:

```bash
sudo chmod o+x /home/ubuntu
```

Validate and reload nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Request certificates after DNS points both names at the host:

```bash
sudo certbot --nginx -d portal.midatlanticocean.org -d prod.mida.ecotrust.org
```

If `prod.mida.ecotrust.org` is no longer live, omit it from nginx and certbot after confirming the
legacy DNS and application usage.

## systemd service

Disable the legacy services before enabling the Docker unit:

```bash
sudo systemctl disable --now uwsgi.service || true
sudo systemctl disable --now stage.service || true
```

Create `/etc/systemd/system/mida.service`:

```ini
[Unit]
Description=MidA Docker Stack
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/portals/mida-portal/docker
ExecStart=/usr/bin/docker compose -f compose.prod.yml --env-file .env up -d
ExecStop=/usr/bin/docker compose -f compose.prod.yml --env-file .env down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mida.service
sudo systemctl start mida.service
sudo systemctl status mida.service --no-pager
```

## Database backups

Install a nightly database dump with retention:

```cron
15 2 * * * cd /home/ubuntu/portals/mida-portal && /bin/bash -lc './scripts/db_dump.sh -c ./docker/compose.prod.yml -e ./docker/.env -d ./docker/backups/sql && find ./docker/backups/sql -type f -name "*.sql" -mtime +10 -delete' >> /home/ubuntu/portals/mida-portal/docker/backups/db_dump.log 2>&1
```

Copy backups off-host or include the directory in the host backup policy. The named PostGIS volume
survives normal `down` and `up` operations, but it is not a substitute for database backups.

## Release and rollback

Deploy a release by changing `IMAGE_TAG` to a known pinned SHA:

```bash
sed -i 's/^IMAGE_TAG=.*/IMAGE_TAG=<new-short-sha>/' docker/.env
docker compose -f docker/compose.prod.yml --env-file docker/.env pull
docker compose -f docker/compose.prod.yml --env-file docker/.env up -d
docker compose -f docker/compose.prod.yml --env-file docker/.env ps
```

Rollback uses the same commands with the previous known-good SHA.

A rebuild of the `madrona-portal` base image does not change production by itself. Rebuild the MidA
overlay against the new `BASE_TAG`, publish a new MidA image, and then bump `IMAGE_TAG`.

## Smoke checks

```bash
curl -sf http://127.0.0.1:8001/ >/dev/null
docker compose -f docker/compose.prod.yml --env-file docker/.env exec app python marco/manage.py shell -c \
  'from django.conf import settings; assert settings.DEBUG is False; print(settings.MEDIA_ROOT)'
docker compose -f docker/compose.prod.yml --env-file docker/.env images app
```

The app image must be `ghcr.io/ecotrust/mida-portal:<pinned-sha>`, and the compose file must contain
no GeoPortal, Elasticsearch, Kibana, Harvester, or WAR dependencies.
