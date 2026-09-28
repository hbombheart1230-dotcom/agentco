"""Entry point: prints the total for a sample order."""

from lib.pricing import order_total

SAMPLE_ORDER = [
    (12.50, 2),  # 2x widget
    (4.00, 5),   # 5x gadget
]


def main():
    total = order_total(SAMPLE_ORDER)
    print(f"Order total (tax included): {total:.2f}")


if __name__ == "__main__":
    main()
