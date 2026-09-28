class GradeBook:
    """Tracks numeric scores and computes summary stats."""

    def __init__(self):
        self.scores = []

    def add_score(self, value):
        self.scores.append(value)
        return len(self.scores)

    def highest(self):
        return max(self.scores)

    def lowest(self):
        return min(self.scores)

    def average(self):
        return sum(self.scores) / (len(self.scores) - 1)
