from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.tables import views

router = DefaultRouter()
router.register("tables", views.TableViewSet, basename="table")

urlpatterns = [
    path("restaurants/mine/order-qr.png", views.TakeawayQRView.as_view(), name="takeaway-qr"),
    path("tables/qr/<uuid:qr_uuid>/", views.ResolveTableView.as_view(), name="table-resolve"),
    path("", include(router.urls)),
]
