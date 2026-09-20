from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken


def _query_param(scope, name):
    query_string = scope.get("query_string", b"").decode()
    return parse_qs(query_string).get(name, [None])[0]


@database_sync_to_async
def _get_staff_user(token):
    from apps.accounts.models import User

    validated = AccessToken(token)
    return User.objects.get(pk=validated["user_id"])


@database_sync_to_async
def _get_customer(token):
    from apps.accounts.models import Customer

    return Customer.objects.get(access_token=token)


class RestaurantDashboardConsumer(AsyncJsonWebsocketConsumer):
    """Staff dashboards (owner/chef/cashier/employee) join their restaurant's
    group and receive push events for every order/payment change."""

    async def connect(self):
        restaurant_id = self.scope["url_route"]["kwargs"]["restaurant_id"]
        token = _query_param(self.scope, "token")
        try:
            user = await _get_staff_user(token) if token else None
        except (TokenError, Exception):  # noqa: BLE001 - any auth failure just closes the socket
            user = None

        if not user or str(user.restaurant_id) != str(restaurant_id):
            await self.close(code=4401)
            return

        self.group_name = f"restaurant_{restaurant_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def order_update(self, event):
        await self.send_json({"type": "order.update", "order": event["order"]})

    async def payment_update(self, event):
        await self.send_json({"type": "payment.update", "payment": event["payment"]})


class OrderStatusConsumer(AsyncJsonWebsocketConsumer):
    """A single order's live status, for the customer's tracking page."""

    async def connect(self):
        order_id = self.scope["url_route"]["kwargs"]["order_id"]
        token = _query_param(self.scope, "token")
        customer = None
        if token:
            try:
                customer = await _get_customer(token)
            except Exception:
                customer = None

        if not customer:
            await self.close(code=4401)
            return

        self.group_name = f"order_{order_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def order_update(self, event):
        await self.send_json({"type": "order.update", "order": event["order"]})
