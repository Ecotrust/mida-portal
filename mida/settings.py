import os, pathlib
# PROJECT_REGION = {
#     'name': 'West Coast',
#     'init_zoom': 5,
#     'init_lat': 40.5,
#     'init_lon': -124.5,
#     'srid': 4326,
#     'map': 'ocean',
# }

# GEOPORTAL_VERSION = 129

# SOLR_COLLECTION = 'collection129'

# SOLR_ENDPOINT = 'https://portal.westcoastoceans.org/solr/%s/select?' % SOLR_COLLECTION

DATA_MANAGER_ADMIN = True

DATA_CATALOG_ENABLED = True

# HANDLER_404 = 'wcoa.views.page_not_found'

FEEDBACK_IFRAME_URL = "//docs.google.com/forms/d/e/1FAIpQLSfI6jIDyQzY1viSzEQHYGo4Z_yhFR49DhMpUIUTErBdkEvtxA/viewform?usp=sf_link"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_DIR = pathlib.Path(__file__).parent.absolute()

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
            os.path.join(APP_DIR, 'templates')
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages'
            ]
        }
    },
]

SUPPORT_INVERTED_COORDINATES = False
ARCGIS_API_KEY = "set in local settings"

try:
    from .local_settings import *
except ImportError:
    print(
        "we recommend using a local settings file; "\
        "`cp local_settings.template local_settings.py` and modify as needed"
    )
    pass
