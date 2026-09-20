from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.orders import views

router = DefaultRouter()
router.register("orders", views.RestaurantOrderViewSet, basename="restaurant-order")

urlpatterns = [
    path("orders/dine-in/", views.DineInOrderCreateView.as_view(), name="order-dine-in"),
    path("orders/takeaway/", views.TakeawayOrderCreateView.as_view(), name="order-takeaway"),
    path("orders/mine/", views.MyOrdersView.as_view(), name="order-mine"),
    path("orders/mine/<uuid:id>/", views.MyOrderDetailView.as_view(), name="order-mine-detail"),
    path("", include(router.urls)),
]
