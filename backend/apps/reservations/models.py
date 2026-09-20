from django.db import models

from apps.common.models import TimeStampedModel


class ReservationStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    CONFIRMED = "confirmed", "Confirmed"
    CANCELLED = "cancelled", "Cancelled"
    COMPLETED = "completed", "Completed"
    NO_SHOW = "no_show", "No Show"


class Reservation(TimeStampedModel):
    restaurant = models.ForeignKey(
        "restaurants.Restaurant", on_delete=models.CASCADE, related_name="reservations"
    )
    customer = models.ForeignKey(
        "accounts.Customer", on_delete=models.CASCADE, related_name="reservations"
    )
    table = models.ForeignKey(
        "tables.Table", null=True, blank=True, on_delete=models.SET_NULL, related_name="reservations"
    )
    date = models.DateField()
    time = models.TimeField()
    party_size = models.PositiveSmallIntegerField(default=2)
    status = models.CharField(
        max_length=20, choices=ReservationStatus.choices, default=ReservationStatus.PENDING
    )
    notes = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ("date", "time")

    def __str__(self):
        return f"{self.customer.name} @ {self.restaurant.name} on {self.date} {self.time}"
