from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import IsRestaurantOwner, IsRestaurantStaff
from apps.restaurants.models import Restaurant, RestaurantStatus
from apps.tables.models import Table
from apps.tables.qr import render_qr_png, table_order_url, takeaway_order_url
from apps.tables.serializers import PublicTableSerializer, TableSerializer


class TableViewSet(viewsets.ModelViewSet):
    """Owner manages tables; any restaurant staff can list/view them."""

    serializer_class = TableSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsRestaurantOwner()]
        return [IsRestaurantStaff()]

    def get_queryset(self):
        return Table.objects.filter(restaurant=self.request.user.restaurant)

    def perform_create(self, serializer):
        serializer.save(restaurant=self.request.user.restaurant)

    @action(detail=True, methods=["get"], permission_classes=[IsRestaurantOwner])
    def qr(self, request, pk=None):
        table = self.get_object()
        return render_qr_png(table_order_url(table))


class TakeawayQRView(generics.GenericAPIView):
    permission_classes = (IsRestaurantOwner,)

    def get(self, request):
        restaurant = request.user.owned_restaurant
        return render_qr_png(takeaway_order_url(restaurant))


class ResolveTableView(generics.RetrieveAPIView):
    """Public: a customer's browser hits this after scanning a table QR to
    confirm the table/restaurant exist and are open for dine-in ordering."""

    serializer_class = PublicTableSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "qr_uuid"
    lookup_url_kwarg = "qr_uuid"

    def get_queryset(self):
        return Table.objects.filter(restaurant__status=RestaurantStatus.ACTIVE)
