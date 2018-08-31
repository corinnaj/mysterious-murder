import names
import random
from evaluator import Instance, PredicateInstance


class StateGenerator:
    pass


class Character(Instance):
    def __init__(self):
        self.gender = 'male' if random.randrange(2) == 1 else 'female'
        # self.full_name = names.get_full_name(gender=self.gender)
        self.full_name = names.get_first_name(gender=self.gender)
        self.name = self.full_name.replace(' ', '_').lower()
        self.predicates = []

    def random_trait(self, type, opposite_type, max_degree=3):
        r = random.randrange(max_degree)
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


def create_characters(count):
    characters = [create_character() for _ in range(count)]
    for i in range(count):
        for j in range(i + 1, count):
            if random.random() < 0.2:
                characters[i].add_relative(characters[j])
            else:
                characters[i].mark_not_related(characters[j])
                if random.random() < 0.25:
                    characters[i].married(characters[j])
                elif random.random() < 0.4:
                    characters[i].lovers(characters[j])

            r = random.randrange(3) 
            characters[i].add_relationsship_trait(characters[j], 'trust', r)
            characters[i].add_relationsship_trait(characters[j], 'disgust', 2 - r)
            r = random.randrange(3) 
            characters[i].add_relationsship_trait(characters[j], 'anger', r)
            characters[i].add_relationsship_trait(characters[j], 'fear', 2 - r)

            r = random.randrange(3) 
            characters[j].add_relationsship_trait(characters[i], 'trust', r)
            characters[j].add_relationsship_trait(characters[i], 'disgust', 2 - r)
            r = random.randrange(3) 
            characters[j].add_relationsship_trait(characters[i], 'anger', r)
            characters[j].add_relationsship_trait(characters[i], 'fear', 2 - r)

    return (characters, sum([c.predicates for c in characters], []))


def create_character():
    c = Character()
    c.alignment(['good', 'neutral', 'evil'][random.randrange(3)])
    c.random_trait('cautious', 'curious')
    c.random_trait('disciplined', 'spontaneous')
    c.random_trait('extrovert', 'introvert')
    c.random_trait('trusting', 'suspicious')
    c.random_trait('confident', 'insecure')
    c.random_trait('sadness', 'joy')
    if random.random() < 0.2:
        c.has_money()
    return c


if __name__ == '__main__':
    characters, state = create_characters(4)
    print(state)

