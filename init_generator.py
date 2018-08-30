#!/usr/bin/env python3

import os
import random
import names
from rules_generator import *

characters = []

class Character(Type):
    def __init__(self):
        self.gender = 'male' if random.randrange(2) == 1 else 'female'
        self.full_name = names.get_full_name(gender=self.gender)
        self.name = self.full_name.replace(' ', '_').lower()
        self.parent = T_CHARACTER
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

def create_characters(count):
    characters = [Character() for _ in range(count)]
    for i in range(0, count):
        character = characters[i]
        for j in range(i + 1, count):
            if random.random() <0.2:
                character.add_relative(characters[j])
            else:
                rand = random.random()
                if rand < 0.25:
                    character.marry(characters[j])
                elif rand < 0.4:
                    character.loves(characters[j])

        character.random_trait(P_NAIVE, P_CUNNING)
        character.random_trait(P_LOYAL, P_GREEDY)

        if random.random() < 0.2: character.possess(T_MONEY)
    return characters

state = sum([character.predicates for character in create_characters(5)], [])
state.append(P_EXISTS_O.using(T_WEAPON))
state.append(P_EXISTS_O.using(T_WEAPON))

possible_actions = []
