from .evaluator import Rule, Outcome
from .evaluator import Predicate as P

A = 0
B = 1
C = 2

rules = []


def rule(name, lhs, *rhs, prob=5, template=None, short_template=None,
         hunger=None, tiredness=None, sanity=None, fulfilment=None,
         social=None, reset_rewards=False, witness_probability=0.5, admit_probability=[0.0]):
    num_outcomes = len(rhs)
    rules.append(Rule(name,
                      lhs,
                      Outcome(only=rhs[0]) if num_outcomes == 1 else Outcome(*rhs),
                      prob=prob,
                      template=template,
                      short_template=short_template,
                      hunger=[0] * num_outcomes if hunger is None else hunger,
                      tiredness=[0] * num_outcomes if tiredness is None else tiredness,
                      sanity=[0] * num_outcomes if sanity is None else sanity,
                      fulfilment=[0] * num_outcomes if fulfilment is None else fulfilment,
                      social=[0] * num_outcomes if social is None else social,
                      witness_probability=witness_probability,
                      admit_probability=admit_probability,
                      reset_rewards=reset_rewards))


def p(name, *args):
    return P(name, *args)


def pK(name, *args):
    return P(name, *args, keep=True)


def pP(name, *args):
    return P(name, *args, permanent=True)


