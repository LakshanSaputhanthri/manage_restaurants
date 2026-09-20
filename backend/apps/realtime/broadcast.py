from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings


def _order_payload(order):
    # Mirrors OrderSerializer's shape exactly (built without request context,
    # so no DRF serializer instance is needed) — the frontend replaces its
    # entire cached Order with this payload, so a partial shape would crash
    # any view still rendering order.items/customer_name/etc.
    payment = getattr(order, "payment", None)
    return {
        "id": str(order.id),
        "restaurant": order.restaurant_id,
        "order_type": order.order_type,
        "table": order.table_id,
        "table_number": order.table.number if order.table_id else None,
        "status": order.status,
        "total_amount": str(order.total_amount),
        "notes": order.notes,
        "items": [
            {
                "id": item.id,
                "menu_item": item.menu_item_id,
                "item_name": item.item_name,
                "unit_price": str(item.unit_price),
                "quantity": item.quantity,
                "notes": item.notes,
            }
            for item in order.items.all()
        ],
        "customer_name": order.customer.name,
        "customer_phone": order.customer.phone,
        "payment_status": payment.status if payment else None,
        "payment_method": payment.method if payment else None,
        "created_at": order.created_at.isoformat(),
        "updated_at": order.updated_at.isoformat(),
    }


def broadcast_order_event(order):
    """Push an order's latest state to both:
    - the restaurant's staff dashboards (`restaurant_{id}` group)
    - the customer's own order tracking page (`order_{id}` group)
    """
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    payload = {"type": "order.update", "order": _order_payload(order)}
    async_to_sync(channel_layer.group_send)(f"restaurant_{order.restaurant_id}", payload)
    async_to_sync(channel_layer.group_send)(f"order_{order.id}", payload)


def _absolute_media_url(field_file):
    if not field_file:
        return None
    return f"{settings.BACKEND_BASE_URL}{field_file.url}"


def broadcast_payment_event(payment):
    """Notifies the restaurant's cashier dashboard of a new/updated payment
    that needs attention (e.g. a bank-transfer slip was just uploaded)."""
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    order = payment.order
    async_to_sync(channel_layer.group_send)(
        f"restaurant_{order.restaurant_id}",
        {
            "type": "payment.update",
            "payment": {
                "id": payment.id,
                "order_id": str(order.id),
                "restaurant_id": order.restaurant_id,
                "method": payment.method,
                "status": payment.status,
                "amount": str(payment.amount),
                "slip_image": _absolute_media_url(payment.slip_image),
                "verified_at": payment.verified_at.isoformat() if payment.verified_at else None,
                "rejection_reason": payment.rejection_reason,
                "created_at": payment.created_at.isoformat(),
            },
        },
    )
