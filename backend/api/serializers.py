from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import UserProfile, Wallet


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    upi_id = serializers.CharField(max_length=255)
    pin_number = serializers.CharField(max_length=6, required=False, write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User already exists")
        return value

    def validate_upi_id(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("UPI ID is required")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        upi_id = validated_data.pop("upi_id")
        pin_number = validated_data.pop("pin_number")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=password,
        )

        UserProfile.objects.create(user=user, upi_id=upi_id, pin_number=pin_number)

        Wallet.objects.create(user=user, balance=1000)

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")

        user = authenticate(username=user_obj.username, password=password)

        return user
