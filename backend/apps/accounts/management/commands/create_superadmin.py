from django.core.management.base import BaseCommand

from apps.accounts.models import User

DEFAULT_USERNAME = "superadmin"
DEFAULT_EMAIL = "superadmin@example.com"
DEFAULT_PASSWORD = "userpassword"


class Command(BaseCommand):
    help = "Creates the default super admin account for local development, if it doesn't already exist."

    def add_arguments(self, parser):
        parser.add_argument("--username", default=DEFAULT_USERNAME)
        parser.add_argument("--email", default=DEFAULT_EMAIL)
        parser.add_argument("--password", default=DEFAULT_PASSWORD)

    def handle(self, *args, **options):
        username = options["username"]
        email = options["email"]
        password = options["password"]

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"User '{username}' already exists, skipping."))
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"Created super admin: {username} / {password}"))
