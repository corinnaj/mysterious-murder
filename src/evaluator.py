import itertools
import random
import re
from graphviz import Digraph
from state import State, StateAccess


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
    def __init__(self, name, *args, keep=False, permanent=False):
        assert not keep and not permanent or keep ^ permanent
        self.name = name
        self.actors = args
        self.keep = keep
        self.permanent = permanent


class PredicateInstance:
    def __init__(self, name, *args, permanent=False):
        self.name = name
        self.actors = args
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
    def __init__(self, rule, args, predicateInstances, prob=1):
        self.rule = rule
        self.args = args
        self.predicateInstances = predicateInstances
        self.prob = prob
        self.produced = []
        self.id = assign_id()

    def __repr__(self):
        args = ','.join([str(a) for a in self.args])
        return self.rule.name + '?(' + args + ')'

    def __eq__(self, value):
        return (isinstance(value, RuleInstance) and
                self.rule == value.rule and
                all(self.args[i] == value.args[i]
                    for i in range(len(self.args))))

    def random_template(self):
        if len(self.rule.template) < 1:
            return None
        return self.rule.template[random.randrange(len(self.rule.template))]

    def story_print(self):
        template = self.random_template()
        if not template:
            return str(self)
        for i in range(self.rule.get_n_actors()):
            actor = self.args[i]
            template = template.replace('{' + str(i) + '}', actor.full_name)
            template = re.sub(r'\[' + str(i) + r'+:([^|]+)\|([^]]+)\]',
                              r'\2' if actor.gender == 'female' else r'\1',
                              template)
        return template

    def apply(self, evaluator):
        # add new from rhs
        for predicate in self.rule.rhs:
            args = [self.args[i] for i in predicate.actors]
            instance = PredicateInstance(predicate.name, *args,
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

    def instance(self, args, predicateInstances=[]):
        return RuleInstance(self, args, predicateInstances, prob=self.prob)


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

    def print_graph(self, view=True, show_all=False):
        GraphPrinter(self, view=view, show_all=show_all)


class GraphPrinter:
    def __init__(self, evaluator, view=False, show_all=False):
        color_inc = 1 / len(evaluator.actors)
        self.actor_colors = {evaluator.actors[i]:
                             '{} s 1.0'.format(str(color_inc * i))
                             for i in range(len(evaluator.actors))}

        self.dot = Digraph(format='svg', engine='dot')
        self.existing_rules = set()
        self.print_instances(evaluator.init_state, show_all=show_all)
        self.dot.render('output', view=view)

    def color_list(self, list, saturation):
        return ':'.join([self.actor_colors[actor].replace('s', str(saturation))
                         for actor in list])

    def print_instances(self, instances, parent=None, show_all=False):
        for instance in instances:
            if instance.consumed_by or show_all:
                self.dot.attr('node',
                              style='striped',
                              fillcolor=self.color_list(instance.actors, 0.1),
                              shape='box')
                self.dot.node(instance.id, str(instance))
                if parent:
                    self.dot.edge(parent.id, instance.id)

        for instance in instances:
            if instance.consumed_by:
                if instance.consumed_by.id not in self.existing_rules:
                    self.print_rule(instance.consumed_by, show_all=show_all)
                self.dot.edge(instance.id, instance.consumed_by.id)

    def print_rule(self, rule, show_all=False):
        self.existing_rules.add(rule.id)
        self.dot.attr('node',
                      style='striped',
                      shape='box',
                      fillcolor=self.color_list(rule.args, 0.4))
        self.dot.node(rule.id, str(rule))
        self.print_instances(rule.produced, rule, show_all=show_all)
