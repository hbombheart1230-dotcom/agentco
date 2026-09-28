"""Minimal HTTP client wrapper. Unrelated to retry configuration lookup."""


def build_url(host: str, path: str) -> str:
    return f"{host.rstrip('/')}/{path.lstrip('/')}"
