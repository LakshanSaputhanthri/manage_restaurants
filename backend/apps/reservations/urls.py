from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.reservations import views

router = DefaultRouter()
router.register("reservations", views.RestaurantReservationViewSet, basename="restaurant-reservation")

urlpatterns = [
    path("reservations/create/", views.CreateReservationView.as_view(), name="reservation-create"),
    path("reservations/mine/", views.MyReservationsView.as_view(), name="reservation-mine"),
    path("", include(router.urls)),
]
