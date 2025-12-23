from django.contrib import admin
from django.urls import path, include
from .views import *

urlpatterns = [
    path("signup/", SignupAPIView.as_view()),
    path("login/", LoginAPIView.as_view()),
    path("profile/", ProfileAPIView.as_view()),
    path("transfer/", TransferAPIView.as_view()),
    path("transactions/", TransactionHistoryAPIView.as_view()),
]
