"""Logging bootstrap helper. Unrelated to retry configuration lookup."""


def format_prefix(component: str) -> str:
    return f"[{component}]"
