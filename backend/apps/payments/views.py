from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.authentication import CustomerTokenAuthentication
from apps.accounts.permissions import IsCashier, IsCustomer
from apps.orders import services
from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer
from apps.payments.models import Payment, PaymentStatus
from apps.payments.serializers import (
    PaymentSerializer,
    RejectPaymentSerializer,
    SubmitTakeawayPaymentSerializer,
)


class SubmitTakeawayPaymentView(generics.GenericAPIView):
    authentication_classes = (CustomerTokenAuthentication,)
    permission_classes = (IsCustomer,)
    serializer_class = SubmitTakeawayPaymentSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        order = get_object_or_404(Order, pk=data["order_id"], customer=request.user)
        try:
            order, payment = services.submit_takeaway_payment(
                order, method=data["method"], slip_image=data.get("slip_image")
            )
        except services.OrderTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {"order": OrderSerializer(order).data, "payment": PaymentSerializer(payment).data}
        )


class PendingPaymentsView(generics.ListAPIView):
    """Cashier's verification queue: bank-transfer slips + cash payments
    awaiting confirmation for their restaurant."""

    serializer_class = PaymentSerializer
    permission_classes = (IsCashier,)

    def get_queryset(self):
        return Payment.objects.filter(
            order__restaurant=self.request.user.restaurant, status=PaymentStatus.PENDING
        ).order_by("created_at")


class VerifyPaymentView(APIView):
    permission_classes = (IsCashier,)

    def post(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id, restaurant=request.user.restaurant)
        try:
            order = services.verify_takeaway_payment(order, cashier=request.user)
        except services.OrderTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(OrderSerializer(order).data)


class RejectPaymentView(generics.GenericAPIView):
    permission_classes = (IsCashier,)
    serializer_class = RejectPaymentSerializer

    def post(self, request, order_id):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = get_object_or_404(Order, pk=order_id, restaurant=request.user.restaurant)
        try:
            order = services.reject_takeaway_payment(
                order, cashier=request.user, reason=serializer.validated_data["reason"]
            )
        except services.OrderTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(OrderSerializer(order).data)
