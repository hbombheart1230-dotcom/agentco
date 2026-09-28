"""Shared input validation helpers."""

import re

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validate_email(email):
    """Return True if `email` looks like a valid email address."""
    return bool(_EMAIL_RE.match(email))


def validate_non_empty(value):
    """Return True if `value` is a non-empty, non-whitespace string."""
    return bool(value and value.strip())
