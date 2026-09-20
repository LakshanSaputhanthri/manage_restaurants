from rest_framework import serializers

from apps.tables.models import Table


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ("id", "number", "capacity", "qr_uuid", "status", "created_at")
        read_only_fields = ("id", "qr_uuid", "created_at")


class PublicTableSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source="restaurant.name", read_only=True)
    restaurant_slug = serializers.CharField(source="restaurant.slug", read_only=True)

    class Meta:
        model = Table
        fields = ("id", "number", "status", "restaurant_name", "restaurant_slug")
