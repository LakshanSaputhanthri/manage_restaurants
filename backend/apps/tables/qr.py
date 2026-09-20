from io import BytesIO

import qrcode
from django.conf import settings
from django.http import HttpResponse


def render_qr_png(data: str) -> HttpResponse:
    img = qrcode.make(data)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return HttpResponse(buffer.getvalue(), content_type="image/png")


def table_order_url(table) -> str:
    return f"{settings.FRONTEND_BASE_URL}/r/{table.restaurant.slug}/t/{table.qr_uuid}"


def takeaway_order_url(restaurant) -> str:
    return f"{settings.FRONTEND_BASE_URL}/r/{restaurant.slug}/order"
