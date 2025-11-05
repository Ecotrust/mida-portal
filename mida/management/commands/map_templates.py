import csv, json
from urllib.parse import urlsplit
from django.core.management.base import BaseCommand
from django.test import Client
from django.urls import get_resolver
from django.conf import settings
from django.test.utils import override_settings

DUMMY_CACHE = {"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}}

try:
    from wagtail.models import Page, Site
    HAS_WAGTAIL = True
except Exception:
    HAS_WAGTAIL = False

class Command(BaseCommand):
    help = "Map URLs to the Django/Wagtail templates used (including inheritance and includes)."

    def handle(self, *args, **opts):
        # turn on template debug and disable caches just for this run
        tmpl = settings.TEMPLATES
        tmpl[0]["OPTIONS"] = {**tmpl[0].get("OPTIONS", {}), "debug": True}

        with override_settings(
            CACHES=DUMMY_CACHE,
            TEMPLATES=tmpl,
            MIDDLEWARE=[
                m for m in settings.MIDDLEWARE
                if m not in (
                    "django.middleware.cache.UpdateCacheMiddleware",
                    "django.middleware.cache.FetchFromCacheMiddleware",
                )
            ],
        ):
            self._run(opts)

    def _run(self, opts):
        client = Client()

    def add_arguments(self, parser):
        parser.add_argument("--outfile-csv", default="page_template_map.csv")
        parser.add_argument("--outfile-json", default="page_template_map.json")
        parser.add_argument("--include-nonwagtail", action="store_true",
                            help="Hit a small set of common non-Wagtail URLs from the URLconf.")
        parser.add_argument("--status-only-200", action="store_true",
                            help="Only record rows where final status_code == 200.")
        parser.add_argument("--follow", action="store_true", help="Follow redirects.")
        parser.add_argument("--limit", type=int, default=None, help="Max pages to probe (Wagtail).")

    def handle(self, *args, **opts):
        client = Client()
        follow = opts["follow"]
        status_only = opts["status_only_200"]
        rows = []
        seen_urls = set()

        def fetch(url, meta=None):
            if not url or url in seen_urls:
                return
            seen_urls.add(url)
            r = client.get(url, follow=follow)
            if status_only and r.status_code != 200:
                return
            data = {
                "url": url,
                "status_code": r.status_code,
                "templates": (r.headers.get("X-Templates-Used") or "").split(",") if r.headers.get("X-Templates-Used") else [],
                "view": r.headers.get("X-View"),
            }
            if meta:
                data.update(meta)
            rows.append(data)

        # 2A) Wagtail pages
        if HAS_WAGTAIL:
            count = 0
            for site in Site.objects.all():
                host = site.hostname
                # Wagtail Page queryset: live + public
                for page in Page.objects.live().public().specific().order_by("path"):
                    if opts["limit"] and count >= opts["limit"]:
                        break
                    try:
                        url = page.get_url(site=site)
                    except TypeError:
                        url = page.get_url()
                    if not url:
                        continue
                    meta = {
                        "host": host,
                        "wagtail_page_id": page.id,
                        "wagtail_page_type": page.__class__.__name__,
                    }
                    fetch(url, meta)
                    count += 1

        # 2B) Optional: a light sweep of non-Wagtail paths (root, health, sitemap)
        if opts["include_nonwagtail"]:
            candidates = set(["/", "/sitemap.xml", "/robots.txt", "/health", "/status", "/api/"])
            # a conservative pass over URLconf to find trivial GET endpoints at root
            try:
                resolver = get_resolver()
                for pattern in resolver.url_patterns:
                    s = str(pattern.pattern)
                    if s.startswith("^"):
                        s = s[1:]
                    s = s.replace("$", "")
                    if s in ("", "/"):
                        candidates.add("/")
                for path in sorted(candidates):
                    fetch(path)
            except Exception:
                for path in sorted(candidates):
                    fetch(path)

        # Write CSV
        with open(opts["outfile_csv"], "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["url","status_code","wagtail_page_id","wagtail_page_type","view","templates"])
            for r in rows:
                w.writerow([
                    r.get("url"),
                    r.get("status_code"),
                    r.get("wagtail_page_id"),
                    r.get("wagtail_page_type"),
                    r.get("view"),
                    ";".join(r.get("templates", [])),
                ])

        # Write JSON
        with open(opts["outfile_json"], "w") as f:
            json.dump(rows, f, indent=2)

        self.stdout.write(self.style.SUCCESS(
            f"Wrote {opts['outfile_csv']} and {opts['outfile_json']} with {len(rows)} rows."
        ))
