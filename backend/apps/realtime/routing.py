from django.urls import re_path

from apps.realtime import consumers

websocket_urlpatterns = [
    re_path(
        r"^ws/restaurants/(?P<restaurant_id>\d+)/$",
        consumers.RestaurantDashboardConsumer.as_asgi(),
    ),
    re_path(
        r"^ws/orders/(?P<order_id>[0-9a-f-]+)/$",
        consumers.OrderStatusConsumer.as_asgi(),
    ),
]
