from django.db import models
from django.db.models import Q

from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    upi_id = models.CharField(max_length=100, unique=True)
    pin_number = models.IntegerField(max_length=10, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.upi_id}"


STATUS_CHOICES = [("SUCCESS", "SUCCESS"), ("FAILED", "FAILED")]


class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(balance__gte=0), name="wallet_balance_gte_0"
            )
        ]

    def __str__(self):
        return f"{self.user.email} ({self.balance})"


class TransactionLog(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sender")
    receiver = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="receiver"
    )
    sender_upi_id = models.CharField(max_length=100, null=True, blank=True)
    receiver_upi_id = models.CharField(max_length=100, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    failure_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"From: {self.sender.email} ({self.sender_upi_id}) To: {self.receiver.email} ({self.receiver_upi_id}) Amount: {self.amount} Status: {self.status}"
