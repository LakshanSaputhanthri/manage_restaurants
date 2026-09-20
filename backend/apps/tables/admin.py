from django.contrib import admin

from apps.tables.models import Table


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ("restaurant", "number", "capacity", "status", "qr_uuid")
    list_filter = ("restaurant", "status")
