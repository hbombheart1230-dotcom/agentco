from pkg.lookup import get_column


def test_get_column_returns_city():
    header = "name,city,age"
    row = "Ada,London,31"
    assert get_column(header, row, "city") == "London"
