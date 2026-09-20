from django.shortcuts import get_object_or_404
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.authentication import CustomerTokenAuthentication
from apps.accounts.permissions import IsCashier, IsCustomer, IsOwnerOrSuperAdmin, IsRestaurantStaff
from apps.reservations.models import Reservation, ReservationStatus
from apps.reservations.serializers import (
    AssignTableSerializer,
    CreateReservationSerializer,
    ReservationSerializer,
)
from apps.restaurants.models import Restaurant, RestaurantStatus
from apps.tables.models import Table


class CreateReservationView(generics.GenericAPIView):
    authentication_classes = (CustomerTokenAuthentication,)
    permission_classes = (IsCustomer,)
    serializer_class = CreateReservationSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        restaurant = get_object_or_404(
            Restaurant, slug=data["restaurant_slug"], status=RestaurantStatus.ACTIVE
        )
        reservation = Reservation.objects.create(
            restaurant=restaurant,
            customer=request.user,
            date=data["date"],
            time=data["time"],
            party_size=data["party_size"],
            notes=data["notes"],
        )
        return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)


class MyReservationsView(generics.ListAPIView):
    authentication_classes = (CustomerTokenAuthentication,)
    permission_classes = (IsCustomer,)
    serializer_class = ReservationSerializer

    def get_queryset(self):
        return Reservation.objects.filter(customer=self.request.user)


class RestaurantReservationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = (IsRestaurantStaff,)

    def get_queryset(self):
        qs = Reservation.objects.filter(restaurant=self.request.user.restaurant)
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    @action(detail=True, methods=["post"], permission_classes=[IsOwnerOrSuperAdmin | IsCashier])
    def confirm(self, request, pk=None):
        reservation = self.get_object()
        serializer = AssignTableSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        table = get_object_or_404(
            Table, pk=serializer.validated_data["table"], restaurant=request.user.restaurant
        )
        reservation.table = table
        reservation.status = ReservationStatus.CONFIRMED
        reservation.save(update_fields=["table", "status"])
        return Response(ReservationSerializer(reservation).data)

    @action(detail=True, methods=["post"], permission_classes=[IsOwnerOrSuperAdmin | IsCashier])
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        reservation.status = ReservationStatus.CANCELLED
        reservation.save(update_fields=["status"])
        return Response(ReservationSerializer(reservation).data)

    @action(detail=True, methods=["post"], permission_classes=[IsOwnerOrSuperAdmin | IsCashier])
    def complete(self, request, pk=None):
        reservation = self.get_object()
        reservation.status = ReservationStatus.COMPLETED
        reservation.save(update_fields=["status"])
        return Response(ReservationSerializer(reservation).data)

    @action(detail=True, methods=["post"], permission_classes=[IsOwnerOrSuperAdmin | IsCashier])
    def no_show(self, request, pk=None):
        reservation = self.get_object()
        reservation.status = ReservationStatus.NO_SHOW
        reservation.save(update_fields=["status"])
        return Response(ReservationSerializer(reservation).data)
