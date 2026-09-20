from django.contrib import admin

from apps.restaurants.models import Restaurant


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "owner", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("name", "slug")
