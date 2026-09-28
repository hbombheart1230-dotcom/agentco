"""Order pricing helpers."""

TAX_RATE = 0.08


def line_total(unit_price, quantity):
    """Return unit_price * quantity."""
    return unit_price * quantity


def apply_tax(subtotal):
    """Return subtotal plus tax."""
    return subtotal * (1 + TAX_RATE)


def order_total(items):
    """items: list of (unit_price, quantity) tuples. Returns tax-inclusive total."""
    subtotal = sum(line_total(price, qty) for price, qty in items)
    return apply_tax(subtotal)
