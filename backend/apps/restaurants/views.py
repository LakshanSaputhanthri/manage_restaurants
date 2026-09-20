from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User
from apps.accounts.permissions import IsOwnerOrSuperAdmin, IsRestaurantOwner, IsSuperAdmin
from apps.restaurants.models import Restaurant, RestaurantStatus
from apps.restaurants.serializers import (
    PublicRestaurantSerializer,
    RestaurantRegisterSerializer,
    RestaurantSerializer,
    StaffMemberSerializer,
)


class RestaurantRegisterView(generics.GenericAPIView):
    """Public self-service signup: creates the Owner account + a Restaurant
    in `pending` status, and logs the owner in immediately so they can see
    their pending-approval state in the dashboard."""

    serializer_class = RestaurantRegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        restaurant = serializer.save()
        refresh = RefreshToken.for_user(restaurant.owner)
        return Response(
            {
                "restaurant": RestaurantSerializer(restaurant).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class RestaurantAdminViewSet(viewsets.ReadOnlyModelViewSet):
    """Super-admin-only view of every restaurant, for onboarding approval."""

    serializer_class = RestaurantSerializer
    permission_classes = (IsSuperAdmin,)
    queryset = Restaurant.objects.all().order_by("-created_at")

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        restaurant = self.get_object()
        restaurant.status = RestaurantStatus.ACTIVE
        restaurant.save(update_fields=["status"])
        return Response(RestaurantSerializer(restaurant).data)

    @action(detail=True, methods=["post"])
    def suspend(self, request, pk=None):
        restaurant = self.get_object()
        restaurant.status = RestaurantStatus.SUSPENDED
        restaurant.save(update_fields=["status"])
        return Response(RestaurantSerializer(restaurant).data)


class MyRestaurantView(generics.RetrieveUpdateAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = (IsRestaurantOwner,)

    def get_object(self):
        return self.request.user.owned_restaurant


class PublicRestaurantDetailView(generics.RetrieveAPIView):
    """Looked up by slug for the customer-facing QR landing page."""

    serializer_class = PublicRestaurantSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "slug"
    queryset = Restaurant.objects.filter(status=RestaurantStatus.ACTIVE)


class StaffViewSet(viewsets.ModelViewSet):
    """Owner-managed CRUD for their restaurant's chef/cashier/employee accounts."""

    serializer_class = StaffMemberSerializer
    permission_classes = (IsOwnerOrSuperAdmin,)

    def get_restaurant(self):
        return self.request.user.owned_restaurant

    def get_queryset(self):
        return User.objects.filter(restaurant=self.get_restaurant()).exclude(
            pk=self.request.user.pk
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["restaurant"] = self.get_restaurant()
        return context
