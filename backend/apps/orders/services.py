"""Order + payment state machine.

Dine-in:   PREPARING -> READY -> SERVED -> COMPLETED
           Payment is recorded at the very end and is always auto-accepted —
           it never blocks anything, since the food has already been served.

Takeaway:  AWAITING_PAYMENT -> [PAYMENT_VERIFYING] -> PREPARING -> READY -> PICKED_UP
           Payment must be verified before the kitchen ever sees the order.
           `online_stub` auto-verifies (stands in for a real gateway's
           instant webhook confirmation); `cash` and `bank_transfer` require
           a cashier to manually verify.
"""

from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.menu.models import MenuItem
from apps.orders.models import Order, OrderItem, OrderStatus, OrderType
from apps.payments.models import Payment, PaymentMethod, PaymentStatus
from apps.realtime.broadcast import broadcast_order_event, broadcast_payment_event


class OrderTransitionError(Exception):
    pass


def _build_order_items(order, items):
    """items: list of {"menu_item_id": int, "quantity": int, "notes": str}"""
    total = Decimal("0")
    order_items = []
    for entry in items:
        menu_item = MenuItem.objects.get(
            pk=entry["menu_item_id"], restaurant_id=order.restaurant_id, is_available=True
        )
        quantity = int(entry.get("quantity", 1))
        order_items.append(
            OrderItem(
                order=order,
                menu_item=menu_item,
                item_name=menu_item.name,
                unit_price=menu_item.price,
                quantity=quantity,
                notes=entry.get("notes", ""),
            )
        )
        total += menu_item.price * quantity
    OrderItem.objects.bulk_create(order_items)
    return total


@transaction.atomic
def create_dine_in_order(customer, table, items, notes=""):
    order = Order.objects.create(
        restaurant=table.restaurant,
        customer=customer,
        order_type=OrderType.DINE_IN,
        table=table,
        status=OrderStatus.PREPARING,
        notes=notes,
    )
    order.total_amount = _build_order_items(order, items)
    order.save(update_fields=["total_amount"])
    broadcast_order_event(order)
    return order


@transaction.atomic
def create_takeaway_order(customer, restaurant, items, notes=""):
    order = Order.objects.create(
        restaurant=restaurant,
        customer=customer,
        order_type=OrderType.TAKEAWAY,
        status=OrderStatus.AWAITING_PAYMENT,
        notes=notes,
    )
    order.total_amount = _build_order_items(order, items)
    order.save(update_fields=["total_amount"])
    broadcast_order_event(order)
    return order


def _require_status(order, *allowed):
    if order.status not in allowed:
        raise OrderTransitionError(
            f"Order is '{order.status}', expected one of {allowed}."
        )


@transaction.atomic
def submit_takeaway_payment(order, method, slip_image=None):
    """Customer chooses how they'll pay for a takeaway order."""
    _require_status(order, OrderStatus.AWAITING_PAYMENT)
    if method == PaymentMethod.BANK_TRANSFER and not slip_image:
        raise OrderTransitionError("A bank transfer requires a slip image.")

    payment, _ = Payment.objects.update_or_create(
        order=order,
        defaults={
            "method": method,
            "amount": order.total_amount,
            "status": PaymentStatus.PENDING,
            "slip_image": slip_image,
        },
    )

    if method == PaymentMethod.ONLINE_STUB:
        # Stands in for a real gateway's instant success webhook.
        _verify_payment(payment, verified_by=None)
        order.status = OrderStatus.PREPARING
    else:
        order.status = OrderStatus.PAYMENT_VERIFYING
    order.save(update_fields=["status"])

    broadcast_payment_event(payment)
    broadcast_order_event(order)
    return order, payment


def _verify_payment(payment, verified_by):
    payment.status = PaymentStatus.VERIFIED
    payment.verified_by = verified_by
    payment.verified_at = timezone.now()
    payment.save(update_fields=["status", "verified_by", "verified_at"])


@transaction.atomic
def verify_takeaway_payment(order, cashier):
    _require_status(order, OrderStatus.PAYMENT_VERIFYING, OrderStatus.AWAITING_PAYMENT)
    payment = order.payment
    _verify_payment(payment, verified_by=cashier)
    order.status = OrderStatus.PREPARING
    order.save(update_fields=["status"])
    broadcast_payment_event(payment)
    broadcast_order_event(order)
    return order


@transaction.atomic
def reject_takeaway_payment(order, cashier, reason=""):
    _require_status(order, OrderStatus.PAYMENT_VERIFYING, OrderStatus.AWAITING_PAYMENT)
    payment = order.payment
    payment.status = PaymentStatus.REJECTED
    payment.verified_by = cashier
    payment.verified_at = timezone.now()
    payment.rejection_reason = reason
    payment.save(update_fields=["status", "verified_by", "verified_at", "rejection_reason"])
    order.status = OrderStatus.AWAITING_PAYMENT
    order.save(update_fields=["status"])
    broadcast_payment_event(payment)
    broadcast_order_event(order)
    return order


@transaction.atomic
def mark_ready(order, actor):
    _require_status(order, OrderStatus.PREPARING)
    order.status = OrderStatus.READY
    order.save(update_fields=["status"])
    broadcast_order_event(order)
    return order


@transaction.atomic
def mark_served(order, actor):
    """Dine-in only: employee delivers the food to the table."""
    _require_status(order, OrderStatus.READY)
    if order.order_type != OrderType.DINE_IN:
        raise OrderTransitionError("Only dine-in orders are 'served'.")
    order.status = OrderStatus.SERVED
    order.save(update_fields=["status"])
    broadcast_order_event(order)
    return order


@transaction.atomic
def mark_picked_up(order, actor):
    """Takeaway only: customer collects the order at the counter."""
    _require_status(order, OrderStatus.READY)
    if order.order_type != OrderType.TAKEAWAY:
        raise OrderTransitionError("Only takeaway orders are 'picked up'.")
    order.status = OrderStatus.PICKED_UP
    order.save(update_fields=["status"])
    broadcast_order_event(order)
    return order


@transaction.atomic
def collect_dine_in_payment(order, cashier, method):
    """Dine-in payment is always auto-accepted — recorded here, never gated."""
    _require_status(order, OrderStatus.SERVED)
    if order.order_type != OrderType.DINE_IN:
        raise OrderTransitionError("Use submit_takeaway_payment for takeaway orders.")
    Payment.objects.update_or_create(
        order=order,
        defaults={
            "method": method,
            "amount": order.total_amount,
            "status": PaymentStatus.VERIFIED,
            "verified_by": cashier,
            "verified_at": timezone.now(),
        },
    )
    order.status = OrderStatus.COMPLETED
    order.save(update_fields=["status"])
    broadcast_order_event(order)
    return order


@transaction.atomic
def cancel_order(order, actor, reason=""):
    if order.status in (OrderStatus.COMPLETED, OrderStatus.PICKED_UP, OrderStatus.CANCELLED):
        raise OrderTransitionError(f"Cannot cancel an order that is already '{order.status}'.")
    order.status = OrderStatus.CANCELLED
    order.notes = (order.notes + f" [cancelled: {reason}]").strip()
    order.save(update_fields=["status", "notes"])
    broadcast_order_event(order)
    return order
