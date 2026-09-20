from django.db import transaction
from rest_framework import serializers

from apps.accounts.models import Role, User
from apps.restaurants.models import Restaurant


class RestaurantSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)

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
            "created_at",
        )
        read_only_fields = ("id", "slug", "status", "created_at")


class PublicRestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ("id", "name", "slug", "address", "phone", "logo", "status")


class RestaurantRegisterSerializer(serializers.Serializer):
    restaurant_name = serializers.CharField(max_length=150)
    address = serializers.CharField(max_length=255, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)
    owner_username = serializers.CharField(max_length=150)
    owner_email = serializers.EmailField(required=False, allow_blank=True)
    owner_password = serializers.CharField(min_length=8, write_only=True)

    def validate_owner_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("That username is already taken.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        owner = User.objects.create_user(
            username=validated_data["owner_username"],
            email=validated_data.get("owner_email", ""),
            password=validated_data["owner_password"],
            role=Role.OWNER,
        )
        restaurant = Restaurant.objects.create(
            name=validated_data["restaurant_name"],
            address=validated_data.get("address", ""),
            phone=validated_data.get("phone", ""),
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
