import json
from decimal import Decimal
from django.db import transaction
from django.db.models import Q
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Wallet, TransactionLog, UserProfile
from .serializers import SignupSerializer, LoginSerializer


class SignupAPIView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()

        return Response(
            {"message": "User registered successfully"}, status=status.HTTP_201_CREATED
        )


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "balance": user.wallet.balance,
                },
            },
            status=status.HTTP_200_OK,
        )


class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        userprofile = UserProfile.objects.get(user=user)
        return Response(
            {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "upi_id": userprofile.upi_id,
                    "balance": user.wallet.balance,
                }
            },
            status=status.HTTP_200_OK,
        )


class TransferAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sender_wallet = request.user.wallet
        sender_upi_id = request.user.profile.upi_id
        receiver_upi_id = request.data["receiver_upi_id"]
        pin_number = request.data["pin_number"]
        amount = Decimal(request.data["amount"])

        try:
            receiver_profile = UserProfile.objects.get(upi_id=receiver_upi_id)
            receiver = receiver_profile.user
        except UserProfile.DoesNotExist:
            return Response({"error": "Receiver UPI ID not found"}, status=404)

        if sender_upi_id == receiver_upi_id:
            return Response(
                {"error": "You cannot transfer money to yourself"}, status=400
            )
        if pin_number != str(request.user.profile.pin_number):
            return Response({"error": "Invalid PIN number"}, status=400)
        try:
            with transaction.atomic():
                sender_wallet = Wallet.objects.select_for_update().get(
                    user=request.user
                )
                receiver_wallet = Wallet.objects.select_for_update().get(user=receiver)

                if sender_wallet.balance < amount:
                    raise ValueError("Insufficient balance")
                sender_wallet.balance -= amount
                receiver_wallet.balance += amount

                sender_wallet.save()
                receiver_wallet.save()

                TransactionLog.objects.create(
                    sender=request.user,
                    receiver=receiver,
                    sender_upi_id=sender_upi_id,
                    receiver_upi_id=receiver_upi_id,
                    amount=amount,
                    status="SUCCESS",
                )
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"user_{request.user.id}",
                    {"type": "transaction_event", "message": "Transfer successful"},
                )
                async_to_sync(channel_layer.group_send)(
                    f"user_{receiver.id}",
                    {"type": "transaction_event", "message": "Money received"},
                )
            return Response({"message": "Transfer successful"}, status=200)

        except Exception as e:
            TransactionLog.objects.create(
                sender=request.user,
                receiver=receiver,
                sender_upi_id=sender_upi_id,
                receiver_upi_id=receiver_upi_id,
                amount=amount,
                status="FAILED",
                failure_reason=str(e),
            )
            return Response({"error": str(e)}, status=400)


class TransactionHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transaction_type = request.query_params.get("type")
        status_filter = request.query_params.get("status")
        logs = TransactionLog.objects.filter(
            Q(sender=request.user) | Q(receiver=request.user)
        ).order_by("-created_at")
        if transaction_type == "SENT":
            logs = logs.filter(sender=request.user)
        elif transaction_type == "RECEIVED":
            logs = logs.filter(receiver=request.user)

        if status_filter in ["SUCCESS", "FAILED"]:
            logs = logs.filter(status=status_filter)
        wallet = Wallet.objects.get(user=request.user)
        data = [
            {
                "sender": log.sender.email,
                "sender_upi_id": log.sender_upi_id,
                "receiver": log.receiver.email,
                "receiver_username": log.receiver.username,
                "receiver_upi_id": log.receiver_upi_id,
                "balance": wallet.balance,
                "amount": log.amount,
                "status": log.status,
                "failure_reason": log.failure_reason,
                "timestamp": log.created_at,
            }
            for log in logs
        ]

        return Response(data, status=200)
