from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound
from  django.views.defaults import page_not_found as dj_page_not_found
from visualize.views import show_planner
from django.views.decorators.clickjacking import xframe_options_exempt

# MidA Should be the default, so we need to find references to these overrides and remove them.

# def index(request):
#     return HttpResponse("Hello, world. You're at the mida index.")
#
# def show_mida_planner(request, template='mida/visualize/planner.html'):
#     return show_planner(request, template)
#
# @xframe_options_exempt
# def show_mida_embedded_map(request, template='mida/visualize/embedded.html'):
#     return show_planner(request, template)
#
# def page_not_found(request, exception=None, template='mida_404.html'):
#     return dj_page_not_found(request, exception, template)
