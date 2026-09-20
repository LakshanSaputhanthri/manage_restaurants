from rest_framework import serializers

from apps.orders.models import Order, OrderItem


class OrderItemInputSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("id", "menu_item", "item_name", "unit_price", "quantity", "notes")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    customer_phone = serializers.CharField(source="customer.phone", read_only=True)
    table_number = serializers.CharField(source="table.number", read_only=True, default=None)
    payment_status = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id",
            "restaurant",
            "order_type",
            "table",
            "table_number",
            "status",
            "total_amount",
            "notes",
            "items",
            "customer_name",
            "customer_phone",
            "payment_status",
            "payment_method",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_payment_status(self, order):
        payment = getattr(order, "payment", None)
        return payment.status if payment else None

    def get_payment_method(self, order):
        payment = getattr(order, "payment", None)
        return payment.method if payment else None


class CreateDineInOrderSerializer(serializers.Serializer):
    table_qr_uuid = serializers.UUIDField()
    items = OrderItemInputSerializer(many=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class CreateTakeawayOrderSerializer(serializers.Serializer):
    restaurant_slug = serializers.SlugField()
    items = OrderItemInputSerializer(many=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class PayDineInSerializer(serializers.Serializer):
    method = serializers.ChoiceField(choices=("cash", "online_stub"))


class CancelOrderSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")
