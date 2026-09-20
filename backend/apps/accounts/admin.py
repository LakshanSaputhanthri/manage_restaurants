from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import Customer, User


@admin.register(User)
class StaffUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Restaurant role", {"fields": ("role", "restaurant")}),
    )
    list_display = ("username", "email", "role", "restaurant", "is_active")
    list_filter = ("role", "restaurant", "is_active")


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "email", "has_account", "created_at")
    search_fields = ("name", "phone", "email")
