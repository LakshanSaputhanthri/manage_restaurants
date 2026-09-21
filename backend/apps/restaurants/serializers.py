from django.db import transaction
from rest_framework import serializers

from apps.accounts.models import Role, User
from apps.restaurants.models import Restaurant


class RestaurantSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    owner_name = serializers.CharField(source="owner.first_name", read_only=True)
    owner_email = serializers.CharField(source="owner.email", read_only=True)

    class Meta:
        model = Restaurant
        fields = (
            "id",
            "name",
            "slug",
            "status",
            "address",
            "phone",
            "logo",
            "owner_username",
            "owner_name",
            "owner_email",
            "created_at",
        )
        read_only_fields = ("id", "slug", "status", "created_at")


class PublicRestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ("id", "name", "slug", "address", "phone", "logo", "status")


class RestaurantRegisterSerializer(serializers.Serializer):
    restaurant_name = serializers.CharField(max_length=150)
    address = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=32)
    owner_name = serializers.CharField(max_length=150)
    owner_address = serializers.CharField(max_length=255)
    owner_email = serializers.EmailField()
    owner_password = serializers.CharField(min_length=8, write_only=True)
    owner_password_confirm = serializers.CharField(min_length=8, write_only=True)

    def validate_owner_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with that email already exists.")
        return value

    def validate(self, attrs):
        if attrs["owner_password"] != attrs["owner_password_confirm"]:
            raise serializers.ValidationError(
                {"owner_password_confirm": "Passwords do not match."}
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        owner = User.objects.create_user(
            username=validated_data["owner_email"],
            email=validated_data["owner_email"],
            password=validated_data["owner_password"],
            first_name=validated_data["owner_name"],
            address=validated_data["owner_address"],
            role=Role.OWNER,
        )
        restaurant = Restaurant.objects.create(
            name=validated_data["restaurant_name"],
            address=validated_data["address"],
            phone=validated_data["phone"],
            owner=owner,
        )
        owner.restaurant = restaurant
        owner.save(update_fields=["restaurant"])
        return restaurant


class StaffMemberSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "password",
        )

    def validate_role(self, value):
        if value not in (Role.CHEF, Role.CASHIER, Role.EMPLOYEE):
            raise serializers.ValidationError(
                "Owners can only create chef, cashier, or employee accounts."
            )
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        restaurant = self.context["restaurant"]
        user = User(**validated_data, restaurant=restaurant)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
