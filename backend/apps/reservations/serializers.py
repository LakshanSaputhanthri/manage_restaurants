from rest_framework import serializers

from apps.reservations.models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    customer_phone = serializers.CharField(source="customer.phone", read_only=True)

    class Meta:
        model = Reservation
        fields = (
            "id",
            "restaurant",
            "table",
            "date",
            "time",
            "party_size",
            "status",
            "notes",
            "customer_name",
            "customer_phone",
            "created_at",
        )
        read_only_fields = ("id", "restaurant", "status", "created_at")


class CreateReservationSerializer(serializers.Serializer):
    restaurant_slug = serializers.SlugField()
    date = serializers.DateField()
    time = serializers.TimeField()
    party_size = serializers.IntegerField(min_value=1, default=2)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class AssignTableSerializer(serializers.Serializer):
    table = serializers.IntegerField()
