import itertools


class Instance:
    def __init__(self, name='unnamed'):
        self.name = name

    def __repr__(self):
        return '<' + self.name + '>'

    def __eq__(self, value):
        return isinstance(value, Instance) and self.name == value.name


class Predicate:
    def __init__(self, name, *args, keep=False):
        self.name = name
        self.actors = args
        self.keep = keep


class PredicateInstance:
    def __init__(self, name, *args):
        self.name = name
        self.actors = args

    def __repr__(self):
        return self.name + '(' + ','.join(str(a) for a in self.actors) + ')'

    # def __eq__(self, value):
    #     return (isinstance(value, PredicateInstance) and
    #             self.name == value.name and
    #             len(self.actors) == len(value.actors) and
    #             all(self.actors[i] == value.actors[i]
    #                 for i in range(len(self.actors))))

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

    def __repr__(self):
        args = ','.join([str(a) for a in self.args])
        return self.rule.name + '?(' + args + ')'

    def __eq__(self, value):
        return (isinstance(value, RuleInstance) and
                self.rule == value.rule and
                all(self.args[i] == value.args[i]
                    for i in range(len(self.args))))

    def apply(self, evaluator):
        # add new from rhs
        for predicate in self.rule.rhs:
            args = [self.args[i] for i in predicate.actors]
            evaluator.state.append(PredicateInstance(predicate.name, *args))
        # consume from lhs
        for i in range(len(self.predicateInstances)):
            if not self.rule.lhs[i].keep:
                evaluator.state.remove(self.predicateInstances[i])


class Rule:
    def __init__(self, name, lhs, rhs, prob=1):
        self.name = name
        self.lhs = lhs
        self.rhs = rhs
        self.prob = prob

    def predicate_list_length(self, predicates):
        if len(predicates) < 1:
            return 0
        return max(index for p in predicates for index in p.actors) + 1

    def get_n_actors(self):
        return max(self.predicate_list_length(self.lhs), self.predicate_list_length(self.rhs))

    def get_options(self, state, actors):
        options = []
        # try all permutations of actors
        for pairs in itertools.permutations(actors, self.get_n_actors()):
            instances = []
            # now for every element on the left hand side...
            for predicate in self.lhs:
                found = False
                # ...look through the state to find a matching instance
                for instance in state:
                    if (instance not in instances and instance.matches(predicate, pairs)):
                        instances.append(instance)
                        found = True
                        continue
                # if we found one, we can proceed, if we found none, we abort
                if not found:
                    break
                else:
                    continue
            # if we managed to fill all slots
            if len(instances) >= len(self.lhs):
                options.append(self.instance(pairs, instances))
        return options

    def instance(self, args, predicateInstances=[]):
        return RuleInstance(self, args, predicateInstances, prob=self.prob)


class Evaluator:
    def __init__(self, rules=[], state=[], actors=[]):
        self.rules = rules
        self.state = state
        self.actors = actors

    def step(self):
        nested = [rule.get_options(self.state, self.actors) for rule in self.rules]
        return [y for x in nested for y in x]


# a = Instance()
# b = Instance()
# c = Instance()
# actors = [a, b, c]
#
# state = [PredicateInstance('anger', a, b)]
#
# rules = [
#    Rule('make_up',
#         [Predicate('anger', 1, 2), Predicate('anger', 2, 1),
#          Predicate('affection', 1, 2)],
#         [Predicate('affection', 1, 2)]),
#    Rule('fight',
#         [Predicate('anger', 1, 2)],
#         [Predicate('anger', 1, 2), Predicate('anger', 1, 2), Predicate('anger', 2, 1)])
# ]
#
