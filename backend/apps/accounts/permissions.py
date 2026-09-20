from rest_framework.permissions import BasePermission

from apps.accounts.models import Customer, Role


class IsStaff(BasePermission):
    """Any authenticated staff user (not a customer)."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and not isinstance(user, Customer))


class IsSuperAdmin(IsStaff):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == Role.SUPER_ADMIN


class IsRestaurantOwner(IsStaff):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == Role.OWNER


class IsChef(IsStaff):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == Role.CHEF


class IsCashier(IsStaff):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == Role.CASHIER


class IsEmployee(IsStaff):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == Role.EMPLOYEE


class IsOwnerOrSuperAdmin(IsStaff):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role in (
            Role.OWNER,
            Role.SUPER_ADMIN,
        )


class IsRestaurantStaff(IsStaff):
    """Any staff role scoped to a restaurant (owner/chef/cashier/employee) —
    excludes the platform super admin, who has no single restaurant."""

    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role != Role.SUPER_ADMIN


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and isinstance(request.user, Customer))
