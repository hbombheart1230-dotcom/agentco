"""Look up a column value from a CSV-style row."""


def get_column(header_line, row_line, column_name):
    """Return the value of `column_name` from a comma-separated row."""
    columns = header_line.split(",")
    values = row_line.split(",")
    index = columns.index(column_name)
    return values[index + 1]
