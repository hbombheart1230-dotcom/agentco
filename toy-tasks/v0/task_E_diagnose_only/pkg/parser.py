def parse_row(header, row):
    """Return the value of the "city" column from a comma-separated row."""
    columns = header.split(",")
    values = row.split(",")
    idx = columns.index("city") + 1
    return values[idx]
