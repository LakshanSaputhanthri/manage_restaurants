from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm

from apps.accounts.models import Customer, User


@admin.register(User)
class StaffUserAdmin(UserAdmin):
    # Unfold overrides the stock read-only-password-hash widget template to
    # drop Django's "change password" link unless the ModelAdmin opts into
    # Unfold's own form classes, which re-add it (see unfold.forms).
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm
    fieldsets = UserAdmin.fieldsets + (
        ("Restaurant role", {"fields": ("role", "restaurant")}),
    )
    list_display = ("username", "email", "role", "restaurant", "is_active")
    list_filter = ("role", "restaurant", "is_active")


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "email", "has_account", "created_at")
    search_fields = ("name", "phone", "email")
