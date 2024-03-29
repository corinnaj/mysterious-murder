from typing import List, Dict
import itertools
import random
from .state import State, StateAccess, hash_name_actors
from .graph import GraphPrinter
from .text_templating import apply as template_apply


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
        self._hash = hash(self.name)

    def __repr__(self):
        return '<' + self.name + '>'

    def __eq__(self, value):
        return isinstance(value, Instance) and self.name == value.name

    def __hash__(self):
        return self._hash


class Predicate:
    def __init__(self, name, *actors, keep=False, permanent=False):
        assert not keep and not permanent or keep ^ permanent
        self.name = name
        self.actors = actors
        self.keep = keep
        self.permanent = permanent

    def to_json(self):
        return {'signature': {'name': self.name, 'actors': self.actors}, 'keep': self.keep, 'permanent': self.permanent}


class PredicateInstance:
    def __init__(self, name, *actors, permanent=False):
        self.name = name
        self.actors = actors
        self.consumed_by = None
        self.produced_by = None
        self.permanent = permanent
        self.id = assign_id()

        self._hash = hash_name_actors(name, actors)

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
    def __init__(self, rule, actors, predicate_instances, prob=1):
        self.rule = rule
        self.actors = actors
        self.predicate_instances = predicate_instances
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

    def __hash__(self):
        s = hash(self.rule)
        for a in self.actors:
            s ^= hash(a)
        return s

    def story_print(self, short=False):
        assert(self.chosen_rhs is not None)

        template = self.rule.template_for_choice(self.chosen_rhs, short=short)
        if not template:
            return str(self)
        return template_apply(template, self.actors, short=short)

    def apply(self, evaluator, record=True, rewards=False):
        # add new from rhs
        self.chosen_rhs = self.rule.rhs.pick()
        for predicate in self.rule.rhs.options[self.chosen_rhs][1]:
            actors = [self.actors[i] for i in predicate.actors]
            instance = PredicateInstance(predicate.name, *actors,
                                         permanent=predicate.permanent)
            if record:
                instance.produced_by = self
                self.produced.append(instance)
            evaluator.state.append(instance)
        # consume from lhs
        for i in range(len(self.predicate_instances)):
            instance = self.predicate_instances[i]
            if not instance.permanent:
                if record:
                    instance.consumed_by = self
                evaluator.state.remove(instance)
                if self.rule.lhs[i].keep:
                    copy = instance.copy()
                    evaluator.state.append(copy)
                    if record:
                        copy.produced_by = self
                        self.produced.append(copy)
        if rewards:
            evaluator.find_actor(self.actors[0]).update_scales(self.rule, self.chosen_rhs)

    def store_observation(self, character_mapping, rule_mapping, fill, i=0):
        fill[i] = rule_mapping[self.rule.name]
        for j in range(len(self.actors)):
            fill[i + j + 1] = character_mapping[self.actors[j]]
        return fill


class Outcome:
    def __init__(self, *options, only=None):
        if only is not None:
            self.options = [(1, only)]
        else:
            self.options = options
        assert(sum(o[0] for o in self.options) == 1.0)

    def pick(self):
        if len(self.options) < 2:
            return 0

        pick = random.random()
        current = 0
        i = 0
        for option in self.options:
            current += option[0]
            if current >= pick:
                return i
            i += 1
        return i - 1

    def predicate_list_length(self):
        if len(self.options) == 1 and len(self.options[0][1]) == 0:
            return 0
        return max(max(index for p in option[1] for index in p.actors) + 1
                   if len(option[1]) > 0 else 0
                   for option in self.options)


class Rule:
    def __init__(self,
                 name,
                 lhs,
                 rhs,
                 prob=5,
                 template=[],
                 short_template=[],
                 hunger=[0],
                 tiredness=[0],
                 social=[0],
                 sanity=[0],
                 fulfilment=[0],
                 witness_probability=0,
                 admit_probability=0,
                 reset_rewards=False):
        self.name = name
        self.lhs = lhs
        self.rhs = rhs if isinstance(rhs, Outcome) else Outcome(only=rhs)
        self.prob = prob
        self.template = template
        self.short_template = short_template
        self.hunger = hunger
        self.tiredness = tiredness
        self.fulfilment = fulfilment
        self.social = social
        self.sanity = sanity
        self.reset_rewards = reset_rewards
        self.witness_probability = witness_probability
        self.admit_probability = admit_probability
        self.n_actors = self.get_n_actors()

    def to_json(self):
        return {
            'name': self.name,
            'lhs': [l.to_json() for l in self.lhs],
            'rhs': [
                {
                    'probability': o[0],
                    'predicates': [p.to_json() for p in o[1]],
                    'template': self.template[i] if self.short_template is None else self.short_template[i],
                    'sanity': self.sanity[i],
                    'fulfilment': self.fulfilment[i],
                    'social': self.social[i],
                    'witness_probability': self.witness_probability,
                    'admit_probability': self.admit_probability[i],
                    'reset_rewards': self.reset_rewards,
                } for i, o in enumerate(self.rhs.options)
            ],
        }

    def precomp_permutations(self, actors):
        self.permutations = []
        for pairs in itertools.permutations(actors, self.n_actors):
            hashes = []
            for predicate in self.lhs:
                actors = [pairs[index] for index in predicate.actors]
                hashes.append(hash_name_actors(predicate.name, actors))
            self.permutations.append((hashes, pairs))

    def template_for_choice(self, choice, short=False):
        templates = (self.short_template
                     if short and self.short_template is not None
                     else self.template)
        if len(templates) < 1:
            return None
        return templates[choice]

    def __eq__(self, other):
        return isinstance(other, Rule) and self.name == other.name

    def __hash__(self):
        return hash(self.name)

    def predicate_list_length(self, predicates):
        if len(predicates) < 1:
            return 0
        return max(index for p in predicates for index in p.actors) + 1

    def get_n_actors(self):
        return max(self.predicate_list_length(self.lhs),
                   self.rhs.predicate_list_length())

    def get_options(self, state, actors):
        options = []
        # try all permutations of actors
        for perm in self.permutations:
            # instances = []
            missing = False
            # fast check
            for h in perm[0]:
                instance = state.fetch_hash(h)
                if len(instance) > 0:
                    # instances.append(instance[0])
                    pass
                else:
                    missing = True
                    break
            if missing:
                continue
            # already found only good options
            # if len(set(id(i) for i in instances)) == len(instances):
            #     options.append(self.instance(perm[1], instances))
            #     continue
            # slow check with duplicate evasion
            state_access = StateAccess(state)
            instances = []
            for h in perm[0]:
                instance = state_access.fetch_hash(h)
                if instance:
                    instances.append(instance)
                else:
                    missing = True
                    break
            if not missing:
                options.append(self.instance(perm[1], instances))
        return options

        # for pairs in itertools.permutations(actors, self.n_actors):
        #     instances = []
        #     state_access.reset()
        #     # now for every element on the left hand side...
        #     for predicate in self.lhs:
        #         actors = [pairs[index] for index in predicate.actors]
        #         instance = state_access.fetch(predicate.name, actors)
        #         if instance:
        #             instances.append(instance)
        #         else:
        #             break
        #     # if we managed to fill all slots
        #     if len(instances) == len(self.lhs):
        #         options.append(self.instance(pairs, instances))
        # return options

    def instance(self, actors, predicate_instances=[]):
        return RuleInstance(self, actors, predicate_instances, prob=self.prob)


class Evaluator:
    def __init__(self, rules=[], state=[], actors=[], is_copy=False):
        self.rules = rules

        is_list = isinstance(state, list)
        self.state = State(state) if is_list else state
        self.init_state = state[:] if is_list else state.flatten()

        self.actors = actors
        if not is_copy:
            for rule in rules:
                rule.precomp_permutations(actors)

    def copy(self):
        return Evaluator(rules=self.rules,
                         state=self.state.copy(),
                         actors=[a.copy() for a in self.actors],
                         is_copy=True)

    def find_actor(self, actor):
        for a in self.actors:
            if a == actor:
                return a

    def step(self) -> List[RuleInstance]:
        nested = [rule.get_options(self.state, self.actors)
                  for rule in self.rules]
        return [y for x in nested for y in x]

    def get_predicate_list(self) -> Dict[str, int]:
        predicates = {}
        for rule in self.rules:
            expanded_rhs = [o[1] for o in rule.rhs.options]
            assert (len(rule.template) == 0 or
                    len(rule.rhs.options) == len(rule.template))
            for predicate in itertools.chain(rule.lhs, *expanded_rhs):
                known_number = predicates.get(predicate.name)
                if known_number:
                    assert known_number == len(predicate.actors)
                else:
                    predicates[predicate.name] = len(predicate.actors)
        return predicates

    def get_rule_names(self) -> List[str]:
        return [rule.name for rule in self.rules]

    def verify_integrity(self):
        # produces failed assertions on rules with non-matching actor counts
        self.get_predicate_list()

    def print_graph(self, view=True, show_all=False):
        GraphPrinter(self, view=view, show_all=show_all)

    def traverse_tree(self, root: PredicateInstance, func):
        func(root)
        print(root.predicate_instances)
        for rule in set(p.produced_by
                        for p in root.predicate_instances
                        if p.produced_by):
            self.traverse_tree(rule, func)
