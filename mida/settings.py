import os, pathlib

DATA_MANAGER_ADMIN = True

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
                'django.contrib.messages.context_processors.messages',
                'visualize.context_processors.viz_gloabal',
            ]
        }
    },
]

SUPPORT_INVERTED_COORDINATES = False
ARCGIS_API_KEY = "set in local settings"
CARTO_API_KEY = "set in local settings"

# Defines which apps/modules interact with the MyPlanner tab in mp-visualize's left nav
# Add 'survey' to this list once Surveys are live on MidA production
# see https://github.com/Ecotrust/mp-visualize/wiki for more info
PLANNER_APPS = [
    'visualize',
    'drawing',
    # 'survey',
]

try:
    from .local_settings import *
except ImportError:
    print(
        "we recommend using a local settings file; "\
        "`cp local_settings.template local_settings.py` and modify as needed"
    )
    pass
