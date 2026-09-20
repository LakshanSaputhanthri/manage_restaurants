import uuid

from django.db import models

from apps.common.models import TimeStampedModel


class TableStatus(models.TextChoices):
    AVAILABLE = "available", "Available"
    OCCUPIED = "occupied", "Occupied"
    RESERVED = "reserved", "Reserved"


class Table(TimeStampedModel):
    restaurant = models.ForeignKey(
        "restaurants.Restaurant", on_delete=models.CASCADE, related_name="tables"
    )
    number = models.CharField(max_length=20)
    capacity = models.PositiveSmallIntegerField(default=4)
    qr_uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=TableStatus.choices, default=TableStatus.AVAILABLE)

    class Meta:
        unique_together = ("restaurant", "number")
        ordering = ("number",)

    def __str__(self):
        return f"{self.restaurant.name} — Table {self.number}"
