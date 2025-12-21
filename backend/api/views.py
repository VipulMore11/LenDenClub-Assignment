from decimal import Decimal
from django.db import transaction
from django.db.models import Q
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response

from .models import Wallet, TransactionLog

class SignupAPIView(APIView):
    def post(self, request):
        email = request.data.get("email")
        username = request.data.get("username")
        password = request.data.get("password")

        if User.objects.filter(email=email).exists():
            return Response({"error": "User already exists"}, status=400)

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email
        )

        Wallet.objects.create(user=user, balance=1000) 

        return Response({"message": "User registered successfully"}, status=201)

class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required"},status=400)
        user_obj = User.objects.get(email=email)
        user = authenticate(username=user_obj.username, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"},status=401)

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username
                }
            },
            status=status.HTTP_200_OK
        )


class TransferAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sender_wallet = request.user.wallet
        receiver_email = request.data["receiver_email"]
        amount = Decimal(request.data["amount"])

        # if request.user.email == receiver_email:
        #     return Response({"error": "You cannot transfer money to yourself"},status=400)

        try:
            with transaction.atomic():
                sender_wallet = Wallet.objects.select_for_update().get(user=request.user)

                if request.user.email.lower() == receiver_email.lower():
                    raise ValueError("Self-transfer is not allowed")

                receiver_wallet = Wallet.objects.select_for_update().get(
                    user__email=receiver_email
                )

                if sender_wallet.balance < amount:
                    raise ValueError("Insufficient balance")
                receiver = User.objects.get(email=receiver_email)
                sender_wallet.balance -= amount
                receiver_wallet.balance += amount

                sender_wallet.save()
                receiver_wallet.save()

                TransactionLog.objects.create(
                    sender=request.user,
                    receiver=receiver,
                    amount=amount,
                    status="SUCCESS"
                )

            return Response({"message": "Transfer successful"}, status=200)

        except Exception as e:
            TransactionLog.objects.create(
                sender=request.user,
                receiver=receiver,
                amount=amount,
                status="FAILED",
                failure_reason=str(e)
            )

            return Response(
                {"error": str(e)},
                status=400)

class TransactionHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transaction_type = request.query_params.get("type")
        status_filter = request.query_params.get("status")
        logs = TransactionLog.objects.filter(Q(sender=request.user) | Q(receiver=request.user)).order_by("-created_at")
        if transaction_type == "SENT":
            logs = logs.filter(sender=request.user)
        elif transaction_type == "RECEIVED":
            logs = logs.filter(receiver=request.user)

        if status_filter in ["SUCCESS", "FAILED"]:
            logs = logs.filter(status=status_filter)
        wallet = Wallet.objects.get(user=request.user)
        data = [{
            "sender": log.sender.email,
            "receiver": log.receiver.email,
            "balance": wallet.balance,
            "amount": log.amount,
            "status": log.status,
            "timestamp": log.created_at
        } for log in logs]

        return Response(data, status=200)
