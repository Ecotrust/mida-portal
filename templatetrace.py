# core/templatetrace.py
from collections import OrderedDict
from django.dispatch import receiver
from django.template.signals import template_rendered
from django.utils.deprecation import MiddlewareMixin
from threading import local

_state = local()

def _ensure():
    if not hasattr(_state, "templates"):
        _state.templates = []
    if not hasattr(_state, "meta"):
        _state.meta = {}

class TemplateTraceMiddleware(MiddlewareMixin):
    def process_request(self, request):
        _ensure()
        _state.templates = []
        _state.meta = {"path": request.path}

    def process_view(self, request, view_func, view_args, view_kwargs):
        _ensure()
        _state.meta["view"] = f"{view_func.__module__}.{view_func.__name__}"

    def process_response(self, request, response):
        # Deduplicate in order (inheritance order preserved)
        try:
            seen = OrderedDict()
            for t in _state.templates:
                seen[t] = True
            response.headers["X-Templates-Used"] = ",".join(seen.keys())
            if "view" in _state.meta:
                response.headers["X-View"] = _state.meta["view"]
        except Exception:
            pass
        return response

@receiver(template_rendered)
def _collect_template(sender, template, context, **kwargs):
    _ensure()
    try:
        print("TEMPLATE_USED:", getattr(template, "name", str(template)))
        name = getattr(template, "name", None) or str(template)
        _state.templates.append(name)
        # Optional: enrich with Wagtail page info if present
        page = context.get("page") or context.get("self")
        if page is not None and hasattr(page, "id"):
            _state.meta["wagtail_page_id"] = getattr(page, "id", None)
            _state.meta["wagtail_page_type"] = page.__class__.__name__
    except Exception:
        pass
