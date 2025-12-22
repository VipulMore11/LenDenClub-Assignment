from django.urls import path
from .consumers import TransactionConsumer

websocket_urlpatterns = [
    path("ws/transactions/", TransactionConsumer.as_asgi()),
]
