from django.contrib import admin

from apps.reservations.models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("customer", "restaurant", "date", "time", "party_size", "status")
    list_filter = ("restaurant", "status")
