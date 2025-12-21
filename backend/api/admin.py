from django.contrib import admin
from .models import Wallet, TransactionLog

admin.site.register(Wallet)
admin.site.register(TransactionLog)