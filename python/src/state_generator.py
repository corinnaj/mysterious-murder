import random
from .character import Character


class StateGenerator:
    pass


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
