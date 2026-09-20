from rest_framework import serializers

from apps.payments.models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.UUIDField(source="order.id", read_only=True)
    restaurant_id = serializers.IntegerField(source="order.restaurant_id", read_only=True)

    class Meta:
        model = Payment
        fields = (
            "id",
            "order_id",
            "restaurant_id",
            "method",
            "status",
            "amount",
            "slip_image",
            "verified_at",
            "rejection_reason",
            "created_at",
        )
        read_only_fields = fields


class SubmitTakeawayPaymentSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()
    method = serializers.ChoiceField(choices=("cash", "online_stub", "bank_transfer"))
    slip_image = serializers.ImageField(required=False)


class RejectPaymentSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, default="")
