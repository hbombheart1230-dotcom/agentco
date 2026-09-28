from pkg.calc import clamp


def test_clamp_below_low_returns_low():
    assert clamp(-5, 0, 10) == 0
