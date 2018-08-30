import names
import random
from evaluator import Instance


class StateGenerator:
    pass


class Character(Instance):
    def __init__(self):
        self.full_name = names.get_full_name(gender=self.gender)
        super(Instance, self).__init__(self.full_name.replace(' ', '_').lower())
        self.gender = 'male' if random.randrange(2) == 1 else 'female'
        self.predicates = []

    def random_trait(self, type, opposite_type, max_degree=3):
        r = random.randrange(max_degree)
        for i in range(r):
            self.predicates.append(type.using(self))
        for i in range(max_degree - r):
            self.predicates.append(opposite_type.using(self))

    def add_relative(self, other):
        self.predicates.append(P_RELATED.using(self, other))
        self.predicates.append(P_RELATED.using(other, self))

    def marry(self, other):
        self.predicates.append(P_MARRIED.using(self, other))
        other.predicates.append(P_MARRIED.using(other, self))

    def loves(self, other):
        self.predicates.append(P_LOVERS.using(self, other))
        self.predicates.append(P_LOVERS.using(other, self))

    def possess(self, obj):
        self.predicates.append(P_HAS.using(self, obj))

