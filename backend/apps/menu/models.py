from django.db import models

from apps.common.models import TimeStampedModel


class Category(TimeStampedModel):
    restaurant = models.ForeignKey(
        "restaurants.Restaurant", on_delete=models.CASCADE, related_name="categories"
    )
    name = models.CharField(max_length=100)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "name")
        unique_together = ("restaurant", "name")
        verbose_name_plural = "categories"

    def __str__(self):
        return f"{self.restaurant.name} — {self.name}"


class MenuItem(TimeStampedModel):
    restaurant = models.ForeignKey(
        "restaurants.Restaurant", on_delete=models.CASCADE, related_name="menu_items"
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="items"
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to="menu_items/", null=True, blank=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ("category__sort_order", "name")

    def __str__(self):
        return f"{self.name} ({self.price})"
