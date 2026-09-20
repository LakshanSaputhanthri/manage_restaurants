from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.menu import views

router = DefaultRouter()
router.register("menu/categories", views.CategoryViewSet, basename="category")
router.register("menu/items", views.MenuItemViewSet, basename="menu-item")

urlpatterns = [
    path("restaurants/<slug:slug>/menu/", views.PublicMenuView.as_view(), name="public-menu"),
    path("", include(router.urls)),
]
