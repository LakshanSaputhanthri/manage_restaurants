import uuid

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.accounts.authentication import CustomerTokenAuthentication
from apps.accounts.models import Customer
from apps.accounts.serializers import (
    CustomerLoginSerializer,
    CustomerRegisterSerializer,
    CustomerSerializer,
    GuestSessionSerializer,
    StaffTokenObtainPairSerializer,
    StaffUserSerializer,
)

__all__ = [
    "StaffLoginView",
    "StaffTokenRefreshView",
    "StaffMeView",
    "GuestSessionView",
    "CustomerRegisterView",
    "CustomerLoginView",
    "CustomerMeView",
]


class StaffLoginView(TokenObtainPairView):
    serializer_class = StaffTokenObtainPairSerializer


class StaffTokenRefreshView(TokenRefreshView):
    pass


class StaffMeView(generics.RetrieveAPIView):
    serializer_class = StaffUserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class GuestSessionView(APIView):
    """Creates a fresh guest Customer + access_token — no password needed.
    Called once when a customer scans a QR code and starts ordering."""

    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = GuestSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        customer = serializer.save()
        return Response(CustomerSerializer(customer).data, status=status.HTTP_201_CREATED)


class CustomerRegisterView(APIView):
    """Upgrades the caller's current guest session into a real account by
    setting a password, so they can log back in from another device."""

    authentication_classes = (CustomerTokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = CustomerRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        customer = request.user
        customer.set_password(serializer.validated_data["password"])
        customer.save()
        return Response(CustomerSerializer(customer).data)


class CustomerLoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = CustomerLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]
        password = serializer.validated_data["password"]

        customer = (
            Customer.objects.filter(phone=phone, has_account=True).order_by("-created_at").first()
        )
        if not customer or not customer.check_password(password):
            return Response({"detail": "Invalid phone or password."}, status=status.HTTP_401_UNAUTHORIZED)

        customer.access_token = uuid.uuid4()
        customer.save(update_fields=["access_token"])
        return Response(CustomerSerializer(customer).data)


class CustomerMeView(generics.RetrieveAPIView):
    serializer_class = CustomerSerializer
    authentication_classes = (CustomerTokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user
