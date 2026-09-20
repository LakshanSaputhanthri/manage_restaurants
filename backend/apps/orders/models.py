import uuid

from django.db import models

from apps.common.models import TimeStampedModel


class OrderType(models.TextChoices):
    DINE_IN = "dine_in", "Dine In"
    TAKEAWAY = "takeaway", "Takeaway"


class OrderStatus(models.TextChoices):
    # Dine-in: PREPARING -> READY -> SERVED -> COMPLETED
    # Takeaway: AWAITING_PAYMENT -> PAYMENT_VERIFYING -> PREPARING -> READY -> PICKED_UP
    AWAITING_PAYMENT = "awaiting_payment", "Awaiting Payment"
    PAYMENT_VERIFYING = "payment_verifying", "Payment Verifying"
    PREPARING = "preparing", "Preparing"
    READY = "ready", "Ready"
    SERVED = "served", "Served"
    PICKED_UP = "picked_up", "Picked Up"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"


class Order(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(
        "restaurants.Restaurant", on_delete=models.CASCADE, related_name="orders"
    )
    customer = models.ForeignKey(
        "accounts.Customer", on_delete=models.CASCADE, related_name="orders"
    )
    order_type = models.CharField(max_length=20, choices=OrderType.choices)
    table = models.ForeignKey(
        "tables.Table", null=True, blank=True, on_delete=models.SET_NULL, related_name="orders"
    )
    status = models.CharField(max_length=25, choices=OrderStatus.choices)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Order {str(self.id)[:8]} — {self.restaurant.name} ({self.status})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    menu_item = models.ForeignKey(
        "menu.MenuItem", null=True, on_delete=models.SET_NULL, related_name="order_items"
    )
    item_name = models.CharField(max_length=150)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveSmallIntegerField(default=1)
    notes = models.CharField(max_length=255, blank=True)

    @property
    def line_total(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.item_name}"
