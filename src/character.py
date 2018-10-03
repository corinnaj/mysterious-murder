import names
from random import randrange
from .evaluator import Instance, PredicateInstance


RELATIONSHIP_DISPLAY_MAPPING = {
    'fear': '\N{grimacing face}',
    'trust': '\N{relieved face}',
    'disgust': '\N{pouting face}',
    'anger': '\N{angry face}',
    'lovers': '\N{smiling face with heart-shaped eyes}',
    'related': None,
    'not_related': None,
    'married': None
}


class Character(Instance):
    def __init__(self):
        self.gender = 'male' if randrange(2) == 1 else 'female'
        # self.full_name = names.get_full_name(gender=self.gender)
        self.full_name = names.get_first_name(gender=self.gender)
        self.name = self.full_name.replace(' ', '_').lower()
        self.predicates = []
        self.predicates.append(PredicateInstance('alive', self))
        self.hunger = self.tiredness = -10
        self.social = self.sanity = self.fulfilment = 0

    def copy(self):
        # immutable
        c = Character()
        c.gender = self.gender
        c.full_name = self.full_name
        c.name = self.name
        c.predicates = self.predicates

        # actual state
        c.hunger = self.hunger
        c.tiredness = self.tiredness
        c.social = self.social
        c.sanity = self.sanity
        c.fulfilment = self.fulfilment

        return c

    def random_trait(self, type, opposite_type, max_degree=3):
        r = randrange(max_degree)
        for i in range(r):
            self.predicates.append(PredicateInstance(type, self))
        for i in range(max_degree - r):
            self.predicates.append(PredicateInstance(opposite_type, self))

    def add_relative(self, other):
        self.predicates.append(PredicateInstance('related', self, other))
        self.predicates.append(PredicateInstance('related', other, self))

    def mark_not_related(self, other):
        self.predicates.append(PredicateInstance('not_related', self, other))
        self.predicates.append(PredicateInstance('not_related', other, self))

    def married(self, other):
        self.predicates.append(PredicateInstance('married', self, other))
        other.predicates.append(PredicateInstance('married', other, self))

    def lovers(self, other):
        self.predicates.append(PredicateInstance('lovers', self, other))
        self.predicates.append(PredicateInstance('lovers', other, self))

    def has_money(self):
        self.predicates.append(PredicateInstance('has_money', self))

    def alignment(self, a):
        self.predicates.append(PredicateInstance(a, self))

    def add_relationsship_trait(self, other, trait, amount):
        for i in range(amount):
            self.predicates.append(PredicateInstance(trait, self, other))

    def update_scales(self, rule):
        self.hunger += rule.hunger
        self.social += rule.social
        self.tiredness += rule.tiredness
        self.fulfilment += rule.fulfilment
        self.sanity += rule.sanity

    def reset_scales(self):
        self.hunger = -10
        self.tiredness = -10
        self.fulfilment -= 10
        self.social -= 10
        self.sanity -= 10

    def relationship_to(self, other, state):
        predicates = state.all_predicates_from_to(self, other)
        return [RELATIONSHIP_DISPLAY_MAPPING[pred.name] for pred in predicates]
