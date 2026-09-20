from rest_framework import generics, permissions, viewsets

from apps.accounts.permissions import IsRestaurantOwner, IsRestaurantStaff
from apps.menu.models import Category, MenuItem
from apps.menu.serializers import CategorySerializer, MenuItemSerializer, PublicCategorySerializer
from apps.restaurants.models import Restaurant, RestaurantStatus


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsRestaurantStaff()]
        return [IsRestaurantOwner()]

    def get_queryset(self):
        return Category.objects.filter(restaurant=self.request.user.restaurant)

    def perform_create(self, serializer):
        serializer.save(restaurant=self.request.user.restaurant)


class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsRestaurantStaff()]
        return [IsRestaurantOwner()]

    def get_queryset(self):
        return MenuItem.objects.filter(restaurant=self.request.user.restaurant)

    def perform_create(self, serializer):
        serializer.save(restaurant=self.request.user.restaurant)


class PublicMenuView(generics.ListAPIView):
    """Full menu (categories + available items) for a customer's ordering
    session, looked up by the restaurant's public slug."""

    serializer_class = PublicCategorySerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        restaurant = generics.get_object_or_404(
            Restaurant, slug=self.kwargs["slug"], status=RestaurantStatus.ACTIVE
        )
        return Category.objects.filter(restaurant=restaurant)
