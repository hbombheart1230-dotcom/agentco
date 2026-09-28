"""Order creation route."""

from app.models.order import Order
from app.utils.validation import validate_email


def create_order(order_id, contact_email, total):
    if not validate_email(contact_email):
        raise ValueError("invalid contact email")
    return Order(order_id, contact_email, total)
