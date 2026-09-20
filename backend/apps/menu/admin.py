from django.contrib import admin

from apps.menu.models import Category, MenuItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "restaurant", "sort_order")
    list_filter = ("restaurant",)


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ("name", "restaurant", "category", "price", "is_available")
    list_filter = ("restaurant", "category", "is_available")
    search_fields = ("name",)
