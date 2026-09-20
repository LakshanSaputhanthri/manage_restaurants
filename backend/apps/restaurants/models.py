from django.db import models
from django.utils.text import slugify

from apps.common.models import TimeStampedModel


class RestaurantStatus(models.TextChoices):
    PENDING = "pending", "Pending Approval"
    ACTIVE = "active", "Active"
    SUSPENDED = "suspended", "Suspended"


class Restaurant(TimeStampedModel):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=170, unique=True, blank=True)
    owner = models.OneToOneField(
        "accounts.User", on_delete=models.CASCADE, related_name="owned_restaurant"
    )
    status = models.CharField(
        max_length=20, choices=RestaurantStatus.choices, default=RestaurantStatus.PENDING
    )
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    logo = models.ImageField(upload_to="restaurant_logos/", null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Restaurant.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                counter += 1
                slug = f"{base_slug}-{counter}"
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        return self.status == RestaurantStatus.ACTIVE

    def __str__(self):
        return self.name
