from django.contrib import admin
from django.urls import include, path, re_path
# from .views import show_mida_planner, show_mida_embedded_map

from . import views

app_name = 'mida'
urlpatterns = [
    # path('', views.index, name='index'),
    # re_path(r'^planner/$', show_mida_planner, name="planner_planner"),
    # re_path(r'^visualize/$', show_mida_planner, name="planner"),
    # re_path(r'^embed/map/$', show_mida_embedded_map, name="show_mida_embedded_map"),
    # re_path(r'^/$', views.index, name='index'),
]
