from django.urls import path

from apps.accounts import views

urlpatterns = [
    path("staff/login/", views.StaffLoginView.as_view(), name="staff-login"),
    path("staff/refresh/", views.StaffTokenRefreshView.as_view(), name="staff-refresh"),
    path("staff/me/", views.StaffMeView.as_view(), name="staff-me"),
    path("customers/guest/", views.GuestSessionView.as_view(), name="customer-guest"),
    path("customers/register/", views.CustomerRegisterView.as_view(), name="customer-register"),
    path("customers/login/", views.CustomerLoginView.as_view(), name="customer-login"),
    path("customers/me/", views.CustomerMeView.as_view(), name="customer-me"),
]
