from pkg.gradebook import GradeBook


def test_add_score():
    gb = GradeBook()
    assert gb.add_score(90) == 1


def test_highest_lowest():
    gb = GradeBook()
    for s in [70, 95, 82]:
        gb.add_score(s)
    assert gb.highest() == 95
    assert gb.lowest() == 70


def test_average():
    gb = GradeBook()
    for s in [80, 90, 100]:
        gb.add_score(s)
    assert gb.average() == 90
