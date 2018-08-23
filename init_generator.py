#!/usr/bin/env python3

import os
import random
import names

characters = []

class Character:
    def __init__(self, name):
        self.gender = 'male' if random.randrange(2) == 1 else 'female'
        self.full_name = names.get_full_name(gender=self.gender)
        self.name = self.full_name.replace(' ', '_').lower()
        self.related = []
        self.lovers = []
        self.possessions = []
        self.married = None
        self.traits = {}
        self.relationships = {}

    def random_trait(self, name, opposite_name, max_degree=3):
        r = random.randrange(max_degree)
        self.traits[(name, opposite_name)] = (r, max_degree - r)

    def relationship(self, name, towards, degree):
        self.relationships[name] = (towards, degree)

    def add_relation(self, other):
        self.related.append(other)
        other.related.append(self)

    def marry(self, other):
        self.married = other
        other.married = self

    def loves(self, other):
        self.lovers.append(other)
        other.lovers.append(self)

    def possess(self, obj):
        self.possessions.append(obj)

    def init_to_string(self):
        rules = ['existsC ' + self.name]
        if self.married:
            rules.append('married ' + self.name + ' ' + self.married.name)

        for r in self.related:
            rules.append('related ' + self.name + ' ' + r.name)

        for l in self.lovers:
            rules.append('lovers ' + self.name + ' ' + l.name)

        for trait, degree in self.traits.items():
            for _ in range(degree[0]):
                rules.append(trait[0] + ' ' + self.name)
            for _ in range(3 - degree[1]):
                rules.append(trait[1] + ' ' + self.name)

        for relationship, degree in self.relationships:
            for _ in range(degree):
                rules.append(relationship[0] + ' ' + self.name + ' ' + relationship[1])

        for possession in self.possessions:
            rules.append('has ' + self.name + ' ' + possession)

        return ',\n'.join(rules)

    def def_to_string(self):
        return self.name + ' : character.'

def create_characters(count):
    characters = [Character(chr(97 + n)) for n in range(count)]
    for i in range(0, count):
        character = characters[i]
        for j in range(i + 1, count):
            if random.random() <0.2:
                character.add_relation(characters[j])
            else:
                rand = random.random()
                if rand < 0.25 and not character.married:
                    character.marry(characters[j])
                elif rand < 0.4:
                    character.loves(characters[j])

        character.random_trait('naive', 'cunning')
        character.random_trait('loyal', 'greedy')

        if random.random() < 0.2: character.possess('money')
    return characters

def generate_init_context(f):
    characters = create_characters(6)
    f.write('\n'.join([c.def_to_string() for c in characters]))
    f.write('\n\ncontext init = {\n')
    f.write(',\n'.join([c.init_to_string() for c in characters]))
    f.write(',\n')
    f.write(',\n'.join(['existsO weapon' for i in range(random.randrange(1, 5))]))
    f.write('\n}.\n\n')

if __name__ == '__main__':
    with open('init', 'w') as f:
        write_init_block(f)
    print('--- init created')
