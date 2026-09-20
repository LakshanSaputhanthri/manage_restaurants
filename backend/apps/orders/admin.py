from django.contrib import admin

from apps.orders.models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "restaurant", "order_type", "status", "total_amount", "created_at")
    list_filter = ("restaurant", "order_type", "status")
    inlines = [OrderItemInline]
