from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView

urlpatterns = [
    path("", RedirectView.as_view(url="admin/", permanent=False)),
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/restaurants/", include("apps.restaurants.urls")),
    path("api/", include("apps.tables.urls")),
    path("api/", include("apps.menu.urls")),
    path("api/", include("apps.reservations.urls")),
    path("api/", include("apps.orders.urls")),
    path("api/", include("apps.payments.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
