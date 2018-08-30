#!/usr/bin/env python3

import os
import random

characters = []

def createCharacters(number):
    result = ''
    for x in range(97, 97 + number):
        result += print_pred_one('existsC', chr(x))
        characters.append(chr(x))
        result += '\n'
    return result

def createAlignment():
    result = ''
    for c in characters:
        r = random.randrange(3)
        if r == 0:
            result += print_pred_one('evil', c)
        elif r == 1:
            result += print_pred_one('neutral', c)
        else:
            result += print_pred_one('good', c)
        result += '\n'
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
        result += print_trait_balance('cautious', 'curious', r, 3 - r, c)
        r = random.randrange(3)
        result += print_trait_balance('disciplined', 'spontaneous', r, 3 - r, c)
        r = random.randrange(3)
        result += print_trait_balance('extrovert', 'introvert', r, 3 - r, c)
        r = random.randrange(3)
        result += print_trait_balance('trusting', 'suspicious', r, 3 - r, c)
        r = random.randrange(3)
        result += print_trait_balance('confident', 'insecure', r, 3 - r, c)

        r = random.randrange(3)
        result += print_trait_balance('sadness', 'joy', r, 3 - r, c)
    return result

def createRelationships():
    result = ''
    for i in range(1, len(characters)):
        for j in range(i + 1, len(characters)):
            r = random.randrange(3)
            result += print_relationship('trust', r, characters[i], characters[j])
            result += print_relationship('disgust', 3 - r, characters[i], characters[j])
            r = random.randrange(3)
            result += print_relationship('anger', r, characters[i], characters[j])
            result += print_relationship('fear', 3 - r, characters[i], characters[j])
    return result

def createRichPeople():
    result = ''
    for c in characters:
        if random.random() < 0.2:
            result += print_pred_one('has_money', c)
    result += '\n'
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

def print_pred_one(pred_name, argument):
    result = ''
    result += pred_name
    result += ' '
    result += argument
    result += ', '
    return result

def print_pred_two(pred_name, argument1, argument2):
    result = ''
    result += pred_name
    result += ' '
    result += argument1
    result += ' '
    result += argument2
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
    f.write(createCharacters(5))
    f.write(createAlignment())
    f.write(createRichPeople())
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
