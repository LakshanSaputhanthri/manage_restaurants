from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.authentication import CustomerTokenAuthentication
from apps.accounts.permissions import (
    IsCashier,
    IsChef,
    IsCustomer,
    IsEmployee,
    IsOwnerOrSuperAdmin,
    IsRestaurantStaff,
)
from apps.orders import services
from apps.orders.models import Order
from apps.orders.serializers import (
    CancelOrderSerializer,
    CreateDineInOrderSerializer,
    CreateTakeawayOrderSerializer,
    OrderSerializer,
    PayDineInSerializer,
)
from apps.restaurants.models import Restaurant, RestaurantStatus
from apps.tables.models import Table


class DineInOrderCreateView(generics.GenericAPIView):
    authentication_classes = (CustomerTokenAuthentication,)
    permission_classes = (IsCustomer,)
    serializer_class = CreateDineInOrderSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        table = get_object_or_404(
            Table, qr_uuid=data["table_qr_uuid"], restaurant__status=RestaurantStatus.ACTIVE
        )
        try:
            order = services.create_dine_in_order(
                customer=request.user, table=table, items=data["items"], notes=data["notes"]
            )
        except services.OrderTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class TakeawayOrderCreateView(generics.GenericAPIView):
    authentication_classes = (CustomerTokenAuthentication,)
    permission_classes = (IsCustomer,)
    serializer_class = CreateTakeawayOrderSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        restaurant = get_object_or_404(
            Restaurant, slug=data["restaurant_slug"], status=RestaurantStatus.ACTIVE
        )
        try:
            order = services.create_takeaway_order(
                customer=request.user, restaurant=restaurant, items=data["items"], notes=data["notes"]
            )
        except services.OrderTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class MyOrdersView(generics.ListAPIView):
    authentication_classes = (CustomerTokenAuthentication,)
    permission_classes = (IsCustomer,)
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)


class MyOrderDetailView(generics.RetrieveAPIView):
    authentication_classes = (CustomerTokenAuthentication,)
    permission_classes = (IsCustomer,)
    serializer_class = OrderSerializer
    lookup_field = "id"

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)


class RestaurantOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """Staff dashboards: list/view orders for their own restaurant.
    Chef/cashier/employee dashboards filter client-side by `?status=`."""

    serializer_class = OrderSerializer
    permission_classes = (IsRestaurantStaff,)

    def get_queryset(self):
        qs = Order.objects.filter(restaurant=self.request.user.restaurant)
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        order_type = self.request.query_params.get("order_type")
        if order_type:
            qs = qs.filter(order_type=order_type)
        return qs

    def _run(self, request, fn, *args, **kwargs):
        order = self.get_object()
        try:
            order = fn(order, request.user, *args, **kwargs)
        except services.OrderTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"], permission_classes=[IsChef])
    def ready(self, request, pk=None):
        return self._run(request, services.mark_ready)

    @action(detail=True, methods=["post"], permission_classes=[IsEmployee])
    def served(self, request, pk=None):
        return self._run(request, services.mark_served)

    @action(detail=True, methods=["post"], permission_classes=[IsEmployee | IsCashier])
    def picked_up(self, request, pk=None):
        return self._run(request, services.mark_picked_up)

    @action(detail=True, methods=["post"], permission_classes=[IsCashier])
    def pay(self, request, pk=None):
        serializer = PayDineInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self._run(request, services.collect_dine_in_payment, serializer.validated_data["method"])

    @action(detail=True, methods=["post"], permission_classes=[IsOwnerOrSuperAdmin | IsCashier])
    def cancel(self, request, pk=None):
        serializer = CancelOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self._run(request, services.cancel_order, serializer.validated_data["reason"])
