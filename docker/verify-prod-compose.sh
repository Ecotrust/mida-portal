#!/usr/bin/env bash
set -Eeuo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env}"
HEALTH_TIMEOUT_SECONDS="${HEALTH_TIMEOUT_SECONDS:-180}"
KEEP_UP="${KEEP_UP:-0}" # set to 1 to skip `down` at the end
DJANGO_CHECK_CMD="${DJANGO_CHECK_CMD:-}" # optional override
DJANGO_SITE_ID_FALLBACK="${DJANGO_SITE_ID_FALLBACK:-1}" # used only for verification check when SITE_ID is unset
DJANGO_SETTINGS_MODULE_FALLBACK="${DJANGO_SETTINGS_MODULE_FALLBACK:-}" # optional fallback when image has no manage.py
HTTP_CHECK_PATH="${HTTP_CHECK_PATH:-/}"
HTTP_CHECK_RETRIES="${HTTP_CHECK_RETRIES:-20}"
HTTP_CHECK_DELAY_SECONDS="${HTTP_CHECK_DELAY_SECONDS:-2}"
STRICT_ENV_CHECKS="${STRICT_ENV_CHECKS:-1}" # set to 0 to skip production key prechecks

SERVICES=("db" "tasks" "app")
REQUIRED_VARS=("IMAGE_TAG" "SECRET_KEY" "DB_PASSWORD")

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

log() { printf "\n[%s] %s\n" "$(date +"%H:%M:%S")" "$*"; }
die() { echo "ERROR: $*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

validate_production_env() {
  if [[ "$STRICT_ENV_CHECKS" != "1" ]]; then
    return 0
  fi

  local recaptcha_public_test_key="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
  local recaptcha_private_test_key="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"

  [[ -n "${RECAPTCHA_PUBLIC_KEY:-}" ]] || die "RECAPTCHA_PUBLIC_KEY is required for production verification."
  [[ -n "${RECAPTCHA_PRIVATE_KEY:-}" ]] || die "RECAPTCHA_PRIVATE_KEY is required for production verification."

  if [[ "${RECAPTCHA_PUBLIC_KEY}" == "$recaptcha_public_test_key" ]]; then
    die "RECAPTCHA_PUBLIC_KEY is set to Google's test key. Use a real production key."
  fi

  if [[ "${RECAPTCHA_PRIVATE_KEY}" == "$recaptcha_private_test_key" ]]; then
    die "RECAPTCHA_PRIVATE_KEY is set to Google's test key. Use a real production key."
  fi
}

wait_for_service() {
  local svc="$1"
  local timeout="$2"
  local start now cid status

  cid="$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps -q "$svc" || true)"
  [[ -n "$cid" ]] || die "No container found for service '$svc'"

  start="$(date +%s)"
  while true; do
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$cid" 2>/dev/null || true)"

    case "$status" in
      healthy|running)
        log "Service '$svc' is $status"
        return 0
        ;;
      exited|dead)
        die "Service '$svc' is $status"
        ;;
    esac

    now="$(date +%s)"
    if (( now - start > timeout )); then
      die "Timed out waiting for '$svc' (last status: ${status:-unknown})"
    fi

    sleep 2
  done
}

check_http_with_retries() {
  local url="$1"
  local retries="$2"
  local delay="$3"
  local attempt app_cid app_state

  app_cid="$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps -q app || true)"

  for ((attempt = 1; attempt <= retries; attempt++)); do
    if [[ -n "$app_cid" ]]; then
      app_state="$(docker inspect --format '{{.State.Status}}' "$app_cid" 2>/dev/null || true)"
      if [[ "$app_state" == "exited" || "$app_state" == "dead" ]]; then
        log "App container state is '$app_state'; stopping HTTP retries."
        log "Recent app logs:"
        docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=200 app || true
        return 1
      fi
    fi

    if curl -fsS -o /dev/null "$url"; then
      log "HTTP check succeeded: $url"
      return 0
    fi

    if (( attempt < retries )); then
      log "HTTP check failed (attempt ${attempt}/${retries}), retrying in ${delay}s..."
      sleep "$delay"
    fi
  done

  log "HTTP check failed after ${retries} attempts: $url"
  log "Recent app logs:"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=200 app || true
  return 1
}

cleanup() {
  if [[ "$KEEP_UP" == "1" ]]; then
    log "KEEP_UP=1, leaving stack running."
    return
  fi
  log "Tearing down stack..."
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down || true
}
trap cleanup EXIT

require_cmd docker
require_cmd curl

[[ -f "$COMPOSE_FILE" ]] || die "Compose file not found: $COMPOSE_FILE"
[[ -f "$ENV_FILE" ]] || die "Env file not found: $ENV_FILE"

log "Loading env file: $ENV_FILE"
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

log "Checking required environment variables..."
for v in "${REQUIRED_VARS[@]}"; do
  [[ -n "${!v:-}" ]] || die "Required variable is missing/empty: $v"
done
validate_production_env

log "Rendering/validating compose config..."
TMP_RENDERED="$(mktemp -t compose.prod.rendered)"
RENDERED_FILE="${TMP_RENDERED}.yml"
mv "$TMP_RENDERED" "$RENDERED_FILE"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" config > "$RENDERED_FILE"
log "Rendered config: $RENDERED_FILE"

log "Pulling images..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull

log "Starting stack..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

log "Current status:"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

log "Waiting for services..."
wait_for_service "db" "$HEALTH_TIMEOUT_SECONDS"
wait_for_service "tasks" "$HEALTH_TIMEOUT_SECONDS"
wait_for_service "app" "$HEALTH_TIMEOUT_SECONDS"

log "Running Django deploy checks..."
DJANGO_SETTINGS_MODULE_EFFECTIVE="${DJANGO_SETTINGS_MODULE:-$DJANGO_SETTINGS_MODULE_FALLBACK}"
if [[ -n "$DJANGO_CHECK_CMD" ]]; then
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T -e SITE_ID="${SITE_ID:-$DJANGO_SITE_ID_FALLBACK}" -e DJANGO_SETTINGS_MODULE="$DJANGO_SETTINGS_MODULE_EFFECTIVE" app sh -lc "$DJANGO_CHECK_CMD"
else
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T -e SITE_ID="${SITE_ID:-$DJANGO_SITE_ID_FALLBACK}" -e DJANGO_SETTINGS_MODULE="$DJANGO_SETTINGS_MODULE_EFFECTIVE" app sh -lc '
    set -e
    MANAGE_PY=""
    CANDIDATES=""
    for d in \
      /usr/local/apps/madrona-portal \
      /usr/local/apps/madrona-portal/apps/mida-portal \
      /usr/local/apps \
      /app \
      /code \
      /opt \
      /srv
    do
      if [ -d "$d" ]; then
        CANDIDATES="${CANDIDATES}
$(find "$d" -maxdepth 8 -type f -name manage.py \
          ! -path "*/ci_testing/*" \
          ! -path "*/tests/*" \
          ! -path "*/test/*" 2>/dev/null || true)"
      fi
    done

    # Prefer the actual portal project over package test fixtures.
    MANAGE_PY="$(printf "%s\n" "$CANDIDATES" | grep -E "/apps/mida-portal/.*/manage\\.py$|/mida-portal/.*/manage\\.py$" | head -n 1 || true)"
    if [ -z "$MANAGE_PY" ]; then
      MANAGE_PY="$(printf "%s\n" "$CANDIDATES" | head -n 1)"
    fi

    if [ -n "$MANAGE_PY" ]; then
      cd "$(dirname "$MANAGE_PY")"
      python manage.py check --deploy
      exit 0
    fi

    if [ -n "${DJANGO_SETTINGS_MODULE:-}" ]; then
      if command -v django-admin >/dev/null 2>&1; then
        django-admin check --deploy
        exit 0
      fi

      python -m django check --deploy
      exit 0
    fi

    echo "ERROR: Could not find a suitable manage.py and DJANGO_SETTINGS_MODULE is not set." >&2
    echo "Set DJANGO_CHECK_CMD (recommended) or set DJANGO_SETTINGS_MODULE_FALLBACK when running this script." >&2
    exit 1
  '
fi

APP_PORT="${APP_PORT:-8001}"
APP_URL="http://localhost:${APP_PORT}${HTTP_CHECK_PATH}"
log "Checking HTTP response on ${APP_URL} ..."
check_http_with_retries "$APP_URL" "$HTTP_CHECK_RETRIES" "$HTTP_CHECK_DELAY_SECONDS"

log "Restarting services to verify restart behavior..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart
wait_for_service "db" "$HEALTH_TIMEOUT_SECONDS"
wait_for_service "tasks" "$HEALTH_TIMEOUT_SECONDS"
wait_for_service "app" "$HEALTH_TIMEOUT_SECONDS"

log "Final status:"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

log "Verification PASSED."