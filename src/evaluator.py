from typing import List, Dict
import itertools
import random
import re
from .state import State, StateAccess
from .graph import GraphPrinter


gid = 0


def assign_id():
    global gid
    gid += 1
    return str(gid)


class Instance:
    def __init__(self, name='unnamed', full_name='unnamed', gender='female'):
        self.name = name
        self.full_name = full_name
        self.gender = gender

    def __repr__(self):
        return '<' + self.name + '>'

    def __eq__(self, value):
        return isinstance(value, Instance) and self.name == value.name

    def __hash__(self):
        return hash(self.name)


class Predicate:
    def __init__(self, name, *actors, keep=False, permanent=False):
        assert not keep and not permanent or keep ^ permanent
        self.name = name
        self.actors = actors
        self.keep = keep
        self.permanent = permanent


class PredicateInstance:
    def __init__(self, name, *actors, permanent=False):
        self.name = name
        self.actors = actors
        self.consumed_by = None
        self.produced_by = None
        self.permanent = permanent
        self.id = assign_id()

    def __repr__(self):
        return self.name + '(' + ','.join(str(a) for a in self.actors) + ')'

    def copy(self):
        assert not self.permanent
        return PredicateInstance(self.name, *self.actors)

    def matches(self, predicate, permutation):
        return (self.name == predicate.name and
                all(self.actors[i] == permutation[predicate.actors[i]]
                    for i in range(len(self.actors))))


class RuleInstance:
    def __init__(self, rule, actors, predicateInstances, prob=1):
        self.rule = rule
        self.actors = actors
        self.predicateInstances = predicateInstances
        self.prob = prob
        self.produced = []
        self.id = assign_id()

    def __repr__(self):
        actors = ','.join([str(a) for a in self.actors])
        return self.rule.name + '?(' + actors + ')'

    def __eq__(self, value):
        return (isinstance(value, RuleInstance) and
                self.rule == value.rule and
                all(self.actors[i] == value.actors[i]
                    for i in range(len(self.actors))))

    def random_template(self):
        if len(self.rule.template) < 1:
            return None
        return self.rule.template[random.randrange(len(self.rule.template))]

    def story_print(self):
        template = self.random_template()
        if not template:
            return str(self)
        for i in range(self.rule.get_n_actors()):
            actor = self.actors[i]
            template = template.replace('{' + str(i) + '}', actor.full_name)
            template = re.sub(r'\[' + str(i) + r'+:([^|]+)\|([^]]+)\]',
                              r'\2' if actor.gender == 'female' else r'\1',
                              template)
        return template

    def apply(self, evaluator):
        # add new from rhs
        for predicate in self.rule.rhs:
            actors = [self.actors[i] for i in predicate.actors]
            instance = PredicateInstance(predicate.name, *actors,
                                         permanent=predicate.permanent)
            instance.produced_by = self
            evaluator.state.append(instance)
            self.produced.append(instance)
        # consume from lhs
        for i in range(len(self.predicateInstances)):
            instance = self.predicateInstances[i]
            if not instance.permanent:
                instance.consumed_by = self
                evaluator.state.remove(instance)
                if self.rule.lhs[i].keep:
                    copy = instance.copy()
                    copy.produced_by = self
                    evaluator.state.append(copy)
                    self.produced.append(copy)

    def store_observation(self, character_mapping, rule_mapping, fill, i=0):
        fill[i] = rule_mapping[self.rule.name]
        for j in range(len(self.actors)):
            fill[i + j + 1] = character_mapping[self.actors[j]]
        return fill


class Rule:
    def __init__(self, name, lhs, rhs, prob=5, template=[]):
        self.name = name
        self.lhs = lhs
        self.rhs = rhs
        self.prob = prob
        self.template = template

    def predicate_list_length(self, predicates):
        if len(predicates) < 1:
            return 0
        return max(index for p in predicates for index in p.actors) + 1

    def get_n_actors(self):
        return max(self.predicate_list_length(self.lhs),
                   self.predicate_list_length(self.rhs))

    def get_options(self, state, actors):
        options = []
        # try all permutations of actors
        state_access = StateAccess(state)
        for pairs in itertools.permutations(actors, self.get_n_actors()):
            instances = []
            state_access.reset()
            # now for every element on the left hand side...
            for predicate in self.lhs:
                actors = [pairs[index] for index in predicate.actors]
                instance = state_access.fetch(predicate.name, actors)
                if instance:
                    instances.append(instance)
                else:
                    break
                # found = False
                # ...look through the state to find a matching instance
                # for instance in state:
                #     if (not self.contains_id(instances, instance) and
                #             instance.matches(predicate, pairs)):
                #         instances.append(instance)
                #         found = True
                #         break
                # # if we found one, we can proceed, if we found none, we abort
                # if not found:
                #     break
                # else:
                #     continue
            # if we managed to fill all slots
            if len(instances) == len(self.lhs):
                options.append(self.instance(pairs, instances))
        return options

    def instance(self, actors, predicateInstances=[]):
        return RuleInstance(self, actors, predicateInstances, prob=self.prob)


class Evaluator:
    def __init__(self, rules=[], state=[], actors=[]):
        self.rules = rules
        self.state = State(state) if isinstance(state, list) else state
        self.init_state = state[:] if isinstance(state, list) else state.flatten()
        self.actors = actors

    def step(self):
        nested = [rule.get_options(self.state, self.actors)
                  for rule in self.rules]
        return [y for x in nested for y in x]

    def get_predicate_list(self) -> Dict[str, int]:
        predicates = {}
        for rule in self.rules:
            for predicate in itertools.chain(rule.lhs, rule.rhs):
                known_number = predicates.get(predicate.name)
                if known_number:
                    assert known_number == len(predicate.actors)
                else:
                    predicates[predicate.name] = len(predicate.actors)
        return predicates

    def get_rule_names(self) -> List[str]:
        return [rule.name for rule in self.rules]

    def verify_integrity(self):
        # produces failed assertions on rules with non-matching wrong actor counts
        self.get_predicate_list()

    def print_graph(self, view=True, show_all=False):
        GraphPrinter(self, view=view, show_all=show_all)
