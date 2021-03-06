import names
from random import randrange, choice, random
from .evaluator import Instance, PredicateInstance
from .emoji import get_random_portrait


RELATIONSHIP_DISPLAY_MAPPING = {
    'fear': '\N{grimacing face}',
    'trust': '\N{relieved face}',
    'disgust': '\N{pouting face}',
    'anger': '\N{angry face}',
    'lovers': '\N{smiling face with heart-shaped eyes}',
    'related': '\N{family}',
    'married': '\N{couple with heart}'
}

POSSESSIONS_DISPLAY_MAPPING = {
    'weapon': '\N{hocho}',
    'nothing': '\N{FACE WITH NO GOOD GESTURE}',
    'money': '\N{MONEY BAG}'
}

MOOD_DISPLAY_MAPPING = {
    'joy':  '\N{GRINNING FACE WITH SMILING EYES}',
    'sadness': '\N{LOUDLY CRYING FACE}'
}

RULE_DISPLAY_MAPPING = {
    'steal': '\N{money bag}',
    'murder': '\N{hocho}',
    'lie': '\U0001f92b',
    'gamble': '\N{slot machine}',
    'fight': '\U0001F92C',
    'get_married': '\N{WEDDING}',
    'get_divorced': '\N{BROKEN HEART}',
    'seduce': '\N{KISS}',
    'get_weapon': '\N{hocho}',
    'pay_debt': '\N{handshake}\N{money bag}',
    'make_up': '\N{HANDSHAKE}',
    'unknown': '\N{BLACK QUESTION MARK ORNAMENT}',
    'nothing': '\N{shrug}'
}


class Character(Instance):
    def __init__(self, empty=False):
        if not empty:
            self.gender = 'male' if randrange(2) == 1 else 'female'
            self.portrait = get_random_portrait(self.gender)
            self.full_name = names.get_full_name(gender=self.gender)
            self.first_name = self.full_name.split(' ')[0]
            self.name = self.full_name.replace(' ', '_').lower()
            self._hash = hash(self.name)
            self.hunger = self.tiredness = -10
            self.social = self.sanity = self.fulfilment = 0
            self.witnessed = []

            self.predicates = []
            self.predicates.append(PredicateInstance('alive', self))
            self.predicates.append(PredicateInstance('single', self))

    def __repr__(self):
        return '<' + self.portrait + '>'

    def copy(self):
        # immutable
        c = Character(empty=True)
        c.gender = self.gender
        c.portrait = self.portrait
        c.full_name = self.full_name
        c.name = self.name
        c.predicates = self.predicates
        c._hash = self._hash

        # actual state
        c.hunger = self.hunger
        c.tiredness = self.tiredness
        c.social = self.social
        c.sanity = self.sanity
        c.fulfilment = self.fulfilment

        return c

    def witness(self, rule_instance):
        self.witnessed.append(rule_instance)

    def witnessed_for_character(self, character):
        rules = [rule for rule in self.witnessed if character in rule.actors]
        if not rules:
            return RULE_DISPLAY_MAPPING['nothing']
        rule = choice(rules)
        print(rule)
        res = []
        res += [rule.actors[0].portrait]
        for x in RULE_DISPLAY_MAPPING:
            if x in rule.rule.name:
                res += RULE_DISPLAY_MAPPING[x]
                break
        if len(rule.actors) > 1:
            res += [rule.actors[1].portrait]
        if len(rule.actors) > 2:
            res += [rule.actors[2].portrait]
        return res

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
        self.predicates = [p for p in self.predicates if p.name != 'single']
        other.predicates.append(PredicateInstance('married', other, self))
        other.predicates = [p for p in other.predicates if p.name != 'single']

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

    def update_scales(self, rule, index):
        if rule.reset_rewards:
            self.hunger = 0
            self.social = 0
            self.tiredness = 0
            self.fulfilment = 0
            self.sanity = 0
        self.hunger += rule.hunger[index]
        self.social += rule.social[index]
        self.tiredness += rule.tiredness[index]
        self.fulfilment += rule.fulfilment[index]
        self.sanity += rule.sanity[index]

    def reset_scales(self):
        self.hunger = -10
        self.tiredness = -10
        self.fulfilment -= 10
        self.social -= 10
        self.sanity -= 10

    def relationship_to(self, other, state):
        res = []
        predicates = state.all_predicates_from_to(self, other)
        for pred in predicates:
            if pred.name in ['lovers', 'married', 'related']:
                res += RELATIONSHIP_DISPLAY_MAPPING[pred.name]
        return res

    def has_weapon(self, state):
        res = []
        predicates = state.all_predicates_from(self)
        for pred in predicates:
            if pred.name == 'has_weapon':
                res += POSSESSIONS_DISPLAY_MAPPING['weapon']
            elif pred.name == 'has_money':
                res += POSSESSIONS_DISPLAY_MAPPING['money']
        if len(res) > 0:
            return res
        return POSSESSIONS_DISPLAY_MAPPING['nothing']

    def feelings_towards(self, other, state):
        res = []
        predicates = state.all_predicates_from_to(self, other)
        for pred in predicates:
            if pred.name in ['anger', 'fear', 'trust', 'distrust']:
                res += RELATIONSHIP_DISPLAY_MAPPING[pred.name]
        return res

    def mood(self, state):
        predicates = state.all_predicates_from(self)
        res = []
        for pred in predicates:
            if pred.name in ['joy', 'sadness']:
                res += MOOD_DISPLAY_MAPPING[pred.name]
        return res

    def dead(self, state):
        return state.contains('dead', [self])

    def calculate_score(self):
        hunger = -abs(self.hunger)
        tiredness = -abs(self.tiredness)
        social = self.social
        fulfilment = self.fulfilment
        sanity = self.sanity

        return social + fulfilment + sanity

    def print_reward_state(self):
        if True:
            print('%s\t%s\t%s\t%s\t%s' % (self.portrait, self.social,
                                          self.fulfilment, self.sanity,
                                          self.calculate_score()))
        else:
            print('%s\t%s' % (self.portrait, self.calculate_score()))

    def go(self, evaluator):
        self.rules = set()
        self.rules_seen = set()
        self.process_predicates(evaluator.init_state)

    def process_predicates(self, predicates):
        for p in predicates:
            if p.consumed_by is not None:
                self.process_rule(p.consumed_by)

    def process_rule(self, rule):
        if rule in self.rules_seen:
            return
        self.rules_seen.add(rule)
        value = random()
        if value <= rule.rule.admit_probability[rule.chosen_rhs]:
            if self in rule.actors:
                self.rules.add(rule)
        self.process_predicates(rule.produced)

    def get_admitted_events(self, evaluator):
        self.go(evaluator)
        for predInstance in evaluator.init_state:
            if predInstance.consumed_by is not None:
                self.process_rule(predInstance.consumed_by)

        for rule in self.witnessed:
            self.rules.add(rule)

        for rule in self.rules:
            print(rule.story_print(short=False))
