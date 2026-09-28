"""User registration route."""

from app.models.user import User
from app.utils.validation import validate_email, validate_non_empty


def register_user(name, email):
    if not validate_non_empty(name):
        raise ValueError("name is required")
    if not validate_email(email):
        raise ValueError("invalid email")
    return User(name, email)
