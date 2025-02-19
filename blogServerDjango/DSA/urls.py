# Create your views here.
from django.contrib import admin
from django.urls import path

from .views import FetchData
urlpatterns = [
    path('/getall' , FetchData.as_view())
]
