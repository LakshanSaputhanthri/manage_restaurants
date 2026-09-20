from django.urls import path

from apps.payments import views

urlpatterns = [
    path("payments/submit/", views.SubmitTakeawayPaymentView.as_view(), name="payment-submit"),
    path("payments/pending/", views.PendingPaymentsView.as_view(), name="payment-pending"),
    path("payments/<uuid:order_id>/verify/", views.VerifyPaymentView.as_view(), name="payment-verify"),
    path("payments/<uuid:order_id>/reject/", views.RejectPaymentView.as_view(), name="payment-reject"),
]
