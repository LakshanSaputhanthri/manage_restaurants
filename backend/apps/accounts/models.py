import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.common.models import TimeStampedModel


class Role(models.TextChoices):
    SUPER_ADMIN = "super_admin", "Super Admin"
    OWNER = "owner", "Restaurant Owner"
    CHEF = "chef", "Chef"
    CASHIER = "cashier", "Cashier"
    EMPLOYEE = "employee", "Employee"


from django.contrib.auth.models import UserManager as DjangoUserManager


class StaffUserManager(DjangoUserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("role", Role.SUPER_ADMIN)
        return super().create_superuser(username, email, password, **extra_fields)


class User(AbstractUser):
    """Staff account: super admin, restaurant owner, chef, cashier, or employee."""

    role = models.CharField(max_length=20, choices=Role.choices)
    address = models.CharField(max_length=255, blank=True)
    restaurant = models.ForeignKey(
        "restaurants.Restaurant",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="staff",
    )

    objects = StaffUserManager()

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def is_super_admin(self):
        return self.role == Role.SUPER_ADMIN

    @property
    def is_owner(self):
        return self.role == Role.OWNER

    @property
    def is_chef(self):
        return self.role == Role.CHEF

    @property
    def is_cashier(self):
        return self.role == Role.CASHIER

    @property
    def is_employee(self):
        return self.role == Role.EMPLOYEE


class Customer(TimeStampedModel):
    """A diner — deliberately NOT built on AUTH_USER_MODEL (which is staff-only).

    Guests get a row with just name/phone plus an `access_token` used to
    authenticate their own order/reservation status calls without a password
    (see CustomerTokenAuthentication). A customer can optionally set a
    `password` so they can log back in from another device/session and see
    their history; logging in simply issues a fresh `access_token`.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=32)
    email = models.EmailField(blank=True)
    password = models.CharField(max_length=128, blank=True)
    has_account = models.BooleanField(default=False)
    access_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    def set_password(self, raw_password):
        from django.contrib.auth.hashers import make_password

        self.password = make_password(raw_password)
        self.has_account = True

    def check_password(self, raw_password):
        from django.contrib.auth.hashers import check_password

        return bool(self.password) and check_password(raw_password, self.password)

    # Duck-type enough of Django's user contract so DRF's IsAuthenticated
    # and request.user usage work for the customer-token auth path too.
    is_authenticated = True
    is_anonymous = False

    def __str__(self):
        return f"{self.name} ({self.phone})"
