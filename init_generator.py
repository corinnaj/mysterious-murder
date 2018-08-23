#!/usr/bin/env python3

import os
import random

characters = []

class Character:
    def __init__(self, name):
        self.name = name
        self.related = []
        self.lovers = []
        self.married = None
        self.traits = {}
        self.relationships = {}

    def random_trait(self, name, opposite_name, max_degree=3):
        r = random.randrange(max_degree)
        self.traits[(name, opposite_name)] = (r, max_degree - r)

    def relationship(self, name, towards, degree):
        self.relationships[name] = (towards, degree)

    def related(self, other):
        self.related.append(other)
        other.related.append(self)

    def married(self, other):
        self.married = other
        other.married = self

    def lovers(self, other):
        self.lovers.add(other)
        other.lovers.add(self)

    def init_to_string(self):
        rules = ['existsC ' + self.name + ',']
        if self.married:
            rules.append('married ' + self.name + ' ' + self.married.name)

        for r in self.related:
            rules.append('related ' + self.name + ' ' + r.name)

        for trait, degree in self.traits:
            for _ in range(degree[0]):
                rules.append(trait[0] + ' ' + self.name)
            for _ in range(3 - degree[1]):
                rules.append(trait[1] + ' ' + self.name)

        for relationship, degree in self.relationships:
            for _ in range(degree):
                rules.append(relationship[0] + ' ' + self.name + ' ' + relationship[1])

        return ',\n'.join(rules)

    def def_to_string(self):
        return self.name + ' : character'

def create_characters(count):
    characters = [Character(chr(97 + n)) for n in range(number)]
    for i in range(0, count):
        character = characters[i]
        for j in range(i + 1, count):
            if random.random() <0.2:
                character.related(characters[j])
            else:
                rand = random.random()
                if rand < 0.25 and not character.married:
                    character.married(characters[j])
                elif rand < 0.4:
                    character.lovers(characters[j])

        character.random_trait('naive', 'cunning')
        character.random_trait('loyal', 'greedy')
        character.random_trait('sadness', 'happiness')
        character.random_trait('paranoia', 'safety')

def createCharacters(number):
    result = ''
    for x in range(97, 97 + number):
        result += 'existsC '
        result += chr(x)
        characters.append(chr(x))
        result += ',\n'
    return result

def createFamilies():
    result = ''
    for i in range(0, len(characters)):
        for j in range(i + 1, len(characters)):
            if random.random() < 0.2:
                result += print_sym_pred('related', characters[i], characters[j])
            else:
                result += print_sym_pred('not_related', characters[i], characters[j])
                rand = random.random()
                if rand < 0.25:
                    result += print_sym_pred('married', characters[i], characters[j]) 
                elif rand < 0.4:
                    result += print_sym_pred('lovers', characters[i], characters[j]) 
    return result

def createTraits():
    result = ''
    for c in characters:
        r = random.randrange(3)
        result += print_trait_balance('naive', 'cunning', r, 3 - r, c)
        r = random.randrange(3)
        result += print_trait_balance('loyal', 'greedy', r, 3 - r, c)

        r = random.randrange(3)
        result += print_trait('paranoia', r, c)
        r = random.randrange(3)
        result += print_trait('sadness', r, c)
    return result

def createRelationships():
    result = ''
    for i in range(1, len(characters)):
        for j in range(i + 1, len(characters)):
            r = random.randrange(3)
            result += print_relationship('affection', r, characters[i], characters[j])
            r = random.randrange(3)
            result += print_relationship('anger', r, characters[i], characters[j])
    return result

def print_relationship(name, amount, character1, character2):
    result = ''
    for i in range(0, amount):
        result += print_pred_two(name, character1, character2)
    result += '\n'
    return result

def print_trait(name, amount, character):
    result = ''
    for i in range(0, amount):
        result += print_pred_one(name, character)
    result += '\n'
    return result

def print_trait_balance(a, b, numA, numB, character):
    result = ''
    result += print_trait(a, numA, character)
    result += print_trait(b, numB, character)
    return result

def print_pred_one(name, character):
    result = ''
    result += name
    result += ' '
    result += character
    result += ', '
    return result

def print_pred_two(name, character1, character2):
    result = ''
    result += name
    result += ' '
    result += character1
    result += ' '
    result += character2
    result += ', '
    return result

def print_sym_pred(name, a, b):
    result = ''
    result += name
    result += ' '
    result += a
    result += ' '
    result += b
    result += ', '
    result += name
    result += ' '
    result += b
    result += ' '
    result += a
    result += ',\n'
    return result

def generate_init_context(f):
    f.write('context init = {\n')
    f.write(createCharacters(5));
    f.write(createFamilies())
    f.write(createTraits())
    f.write(createRelationships())
    f.seek(f.tell() - 3)
    f.truncate()
    f.write('}.')

if __name__ == '__main__':
    with open('init', 'w') as f:
        generate_init_context(f)
    print('init created')
