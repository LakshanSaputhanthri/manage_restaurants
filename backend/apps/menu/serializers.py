from rest_framework import serializers

from apps.menu.models import Category, MenuItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "sort_order")


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = (
            "id",
            "category",
            "name",
            "description",
            "price",
            "image",
            "is_available",
        )


class PublicMenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ("id", "category", "name", "description", "price", "image")


class PublicCategorySerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "sort_order", "items")

    def get_items(self, category):
        items = category.items.filter(is_available=True)
        return PublicMenuItemSerializer(items, many=True).data
