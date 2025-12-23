from django.contrib import admin
from .models import Wallet, TransactionLog, UserProfile

admin.site.register(Wallet)
admin.site.register(TransactionLog)
admin.site.register(UserProfile)
