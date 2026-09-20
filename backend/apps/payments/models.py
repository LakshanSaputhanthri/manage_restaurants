from django.db import models

from apps.common.models import TimeStampedModel


class PaymentMethod(models.TextChoices):
    CASH = "cash", "Cash"
    ONLINE_STUB = "online_stub", "Online Payment"
    BANK_TRANSFER = "bank_transfer", "Bank Transfer"


class PaymentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    VERIFIED = "verified", "Verified"
    REJECTED = "rejected", "Rejected"


class Payment(TimeStampedModel):
    order = models.OneToOneField(
        "orders.Order", on_delete=models.CASCADE, related_name="payment"
    )
    method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    slip_image = models.ImageField(upload_to="payment_slips/", null=True, blank=True)
    verified_by = models.ForeignKey(
        "accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="verified_payments"
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Payment for {self.order_id} — {self.method} ({self.status})"
