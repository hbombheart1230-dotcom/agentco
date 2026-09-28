from utils.slugify import slugify


def test_slugify_basic():
    assert slugify("Hello World!") == "hello-world"


def test_slugify_extra_spaces():
    assert slugify("  Multiple   Spaces  ") == "multiple-spaces"
