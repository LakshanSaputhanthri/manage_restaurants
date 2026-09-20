from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import Role, User
from apps.menu.models import Category, MenuItem
from apps.restaurants.models import Restaurant, RestaurantStatus
from apps.tables.models import Table

STAFF_PASSWORD = "password123"


class Command(BaseCommand):
    help = "Seeds a demo restaurant with staff, tables, and a menu for local testing."

    @transaction.atomic
    def handle(self, *args, **options):
        if not User.objects.filter(username="superadmin").exists():
            User.objects.create_superuser(
                username="superadmin", email="superadmin@example.com", password=STAFF_PASSWORD
            )
            self.stdout.write(self.style.SUCCESS("Created super admin: superadmin / " + STAFF_PASSWORD))

        owner, created = User.objects.get_or_create(
            username="owner_demo", defaults={"role": Role.OWNER, "email": "owner@example.com"}
        )
        if created:
            owner.set_password(STAFF_PASSWORD)
            owner.save()

        restaurant, created = Restaurant.objects.get_or_create(
            owner=owner,
            defaults={
                "name": "The Demo Bistro",
                "status": RestaurantStatus.ACTIVE,
                "address": "123 Main Street",
                "phone": "0770000000",
            },
        )
        if not created and restaurant.status != RestaurantStatus.ACTIVE:
            restaurant.status = RestaurantStatus.ACTIVE
            restaurant.save(update_fields=["status"])

        if owner.restaurant_id != restaurant.id:
            owner.restaurant = restaurant
            owner.save(update_fields=["restaurant"])

        for username, role in (
            ("chef_demo", Role.CHEF),
            ("cashier_demo", Role.CASHIER),
            ("employee_demo", Role.EMPLOYEE),
        ):
            user, created = User.objects.get_or_create(
                username=username, defaults={"role": role, "restaurant": restaurant}
            )
            if created:
                user.set_password(STAFF_PASSWORD)
                user.save()

        for i in range(1, 6):
            Table.objects.get_or_create(restaurant=restaurant, number=str(i), defaults={"capacity": 4})

        starters, _ = Category.objects.get_or_create(
            restaurant=restaurant, name="Starters", defaults={"sort_order": 1}
        )
        mains, _ = Category.objects.get_or_create(
            restaurant=restaurant, name="Mains", defaults={"sort_order": 2}
        )
        drinks, _ = Category.objects.get_or_create(
            restaurant=restaurant, name="Drinks", defaults={"sort_order": 3}
        )

        menu_items = [
            (starters, "Spring Rolls", "Crispy vegetable spring rolls (4 pcs)", "5.50"),
            (starters, "Chicken Wings", "Spicy grilled wings (6 pcs)", "7.00"),
            (mains, "Margherita Pizza", "Tomato, mozzarella, basil", "9.50"),
            (mains, "Grilled Chicken Rice", "Grilled chicken breast with fried rice", "8.00"),
            (mains, "Beef Burger", "Beef patty, cheese, lettuce, fries", "8.50"),
            (drinks, "Fresh Lime Soda", "Sparkling lime soda", "2.00"),
            (drinks, "Iced Coffee", "Cold brew with milk", "3.00"),
        ]
        for category, name, description, price in menu_items:
            MenuItem.objects.get_or_create(
                restaurant=restaurant,
                name=name,
                defaults={"category": category, "description": description, "price": price},
            )

        self.stdout.write(self.style.SUCCESS(f"Seeded restaurant '{restaurant.name}' (slug={restaurant.slug})"))
        self.stdout.write("Staff logins (password = %s):" % STAFF_PASSWORD)
        self.stdout.write("  super admin : superadmin")
        self.stdout.write("  owner       : owner_demo")
        self.stdout.write("  chef        : chef_demo")
        self.stdout.write("  cashier     : cashier_demo")
        self.stdout.write("  employee    : employee_demo")
        self.stdout.write(f"Tables 1-5 created. Table QR uuids:")
        for t in restaurant.tables.all():
            self.stdout.write(f"  table {t.number}: {t.qr_uuid}")
