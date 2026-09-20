from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.restaurants import views

router = DefaultRouter()
router.register("admin", views.RestaurantAdminViewSet, basename="restaurant-admin")
router.register("staff", views.StaffViewSet, basename="restaurant-staff")

urlpatterns = [
    path("register/", views.RestaurantRegisterView.as_view(), name="restaurant-register"),
    path("mine/", views.MyRestaurantView.as_view(), name="restaurant-mine"),
    path("public/<slug:slug>/", views.PublicRestaurantDetailView.as_view(), name="restaurant-public"),
    path("", include(router.urls)),
]
