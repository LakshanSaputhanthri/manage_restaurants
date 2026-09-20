from django.core.exceptions import ValidationError
from rest_framework import authentication, exceptions

from apps.accounts.models import Customer

CUSTOMER_TOKEN_HEADER = "HTTP_X_CUSTOMER_TOKEN"


class CustomerTokenAuthentication(authentication.BaseAuthentication):
    """Authenticates guest/registered customers via an opaque access token
    sent in the `X-Customer-Token` header — no password required for guests."""

    def authenticate(self, request):
        token = request.META.get(CUSTOMER_TOKEN_HEADER)
        if not token:
            return None
        try:
            customer = Customer.objects.get(access_token=token)
        except (Customer.DoesNotExist, ValueError, ValidationError):
            raise exceptions.AuthenticationFailed("Invalid customer token.")
        return (customer, None)
