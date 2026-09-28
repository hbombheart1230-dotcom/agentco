"""Computes the discounted price for an order."""


def discounted_price(amount):
    rate = 0.10
    return amount * (1 - rate)
