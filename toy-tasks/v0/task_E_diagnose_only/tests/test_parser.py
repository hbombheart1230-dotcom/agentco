from pkg.parser import parse_row


def test_parse_row_returns_city():
    header = "name,age,city"
    row = "Alice,30,Seattle"
    assert parse_row(header, row) == "Seattle"
