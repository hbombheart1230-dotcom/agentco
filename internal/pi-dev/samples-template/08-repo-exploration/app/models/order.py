"""Order model."""


class Order:
    def __init__(self, order_id, contact_email, total):
        self.order_id = order_id
        self.contact_email = contact_email
        self.total = total
