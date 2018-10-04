from .evaluator import Predicate as P
from .evaluator import Rule, Evaluator
from .state_generator import create_characters
from .simulation import Simulation

A = 0
B = 1
C = 2

rules = []


def rule(name, lhs, rhs, prob=5, template=[], hunger=0, tiredness=0, sanity=0,
         fulfilment=0, social=0, reset_rewards=False):
    rules.append(Rule(name, lhs, rhs,
                      prob=prob,
                      template=template,
                      hunger=hunger,
                      tiredness=tiredness,
                      sanity=sanity,
                      fulfilment=fulfilment,
                      social=social,
                      reset_rewards=reset_rewards))


def p(name, *args):
    return P(name, *args)


def pK(name, *args):
    return P(name, *args, keep=True)


def pP(name, *args):
    return P(name, *args, permanent=True)


def alive(*args):
    return [pK('alive', a) for a in args]


def suspicious(a):
    return P('suspicious', a, keep=True)


def trusting(a):
    return P('trusting', a, keep=True)


def spontaneous(a):
    return P('spontaneous', a, keep=True)


def confident(a):
    return P('confident', a, keep=True)


def good(a):
    return P('good', a, keep=True)


def neutral(a):
    return P('neutral', a, keep=True)


def evil(a):
    return P('evil', a, keep=True)


def greed(a):
    return [P('spontaneous', a, keep=True), P('confident', a, keep=True)]


rule('eat', [*alive(A)], [], hunger=10)
rule('sleep', [*alive(A)], [], tiredness=10)
rule('talk', [*alive(A, B)], [], social=5)
rule('work', [*alive(A)], [], sanity=5, fulfilment=10)

rule('get_weapon',
     [*alive(A)],
     [P('has_weapon', 0)],
     template=['{0} acquired a weapon.'])
# A spreads rumor about B to C
rule('lie_success',
     [
         *alive(A, B, C),
         P('anger', A, B, keep=True),
         P('disgust', A, B, keep=True),
         trusting(C),
         trusting(C),
         P('trust', C, A, keep=True)
     ],
     [P('disgust', C, B)],
     template=['{0} told some dirty rumors about {2} to {1}.'])

rule('lie_fail',
     [
         *alive(A, B, C),
         P('anger', A, B, keep=True),
         P('disgust', A, B, keep=True),
         suspicious(C),
         suspicious(C),
         P('trust', C, B, keep=True)
     ],
     [
         P('disgust', C, A),
         P('anger', C, A)
     ],
     template=['{0} tried to tell {1} lies about {2}, but got caught redhanded!'])

rule('fight',
     [
         *alive(A, B),
         pK('anger', A, B)],
     [P('anger', B, A)],
     template=['{0} and {1} ended up fighting.'], social=-10)

rule('make_up',
     [
         *alive(A, B),
         P('anger', A, B),
         P('anger', B, A),
         P('trust', A, B, keep=True)],
     [], template=['{0} and {1} made up.'], social=10)


rule('seduce',
     [
         *alive(A, B),
         P('attraction', A, B, keep=True),
         P('attraction', B, A, keep=True),
         P('not_related', A, B, keep=True),
         P('not_related', B, A, keep=True)],
     [
         P('lovers', A, B),
         P('lovers', B, A)],
     template=['{0} seduced {1}.'])

# TODO check if they are already married
rule('get_married',
     [
         *alive(A, B),
         *[P('trust', A, B, keep=True)] * 2,
         *[P('trust', B, A, keep=True)] * 2,
         P('not_related', A, B, keep=True),
         P('not_related', B, A, keep=True)],
     [
         P('married', A, B),
         P('married', B, A)],
     template=['{0} and {1} got married!'],
     social=30,
     sanity=10)

rule('get_divorced',
     [
         *alive(A, B),
         *[P('disgust', B, A, keep=True)] * 3,
         P('married', A, B),
         P('married', B, A)],
     [],
     template=['{0} and {1} got divorced.'],
     social=-10,
     sanity=-10)

rule('steal_not_caught_E',
     [
        *alive(A, B),
        evil(A),
        P('has_money', B)],
     [
        P('has_money', A)],
     template=['{0} managed to steal from {1}, unnoticed.'])

rule('steal_not_caught_N',
     [
        *alive(A, B),
        neutral(A),
        *greed(A),
        P('has_money', B),
        P('disgust', A, B, keep=True)],
     [P('has_money', A)],
     template=['{0} managed to steal from {1}, unnoticed.'])

rule('steal_caught_E',
     [
        *alive(A, B),
        evil(A),
        P('has_money', B)],
     [P('anger', B, A)] * 2,
     template=['{0} tried to steal from {1}, but {1} caught [0:him|her]!'])

rule('steal_caught_N',
     [
        *alive(A, B),
        neutral(A),
        *greed(A),
        P('has_money', B),
        pK('disgust', A, B)],
     [P('anger', B, A)] * 2,
     template=['{0} tried to steal from {1}, but {1} caught [0:him|her]!'])

rule('murder_anger',
     [
         pK('has_weapon', A),
         *[p('anger', A, B)] * 3,
         *alive(A),
         p('alive', B)],
     [P('dead', B, permanent=True)],
     template=['In a fit of anger, {0} killed {1}.'],
     fulfilment=300,
     sanity=-80)

rule('murder_cheating',
     [*alive(A, C),
      p('alive', B),
      pK('has_weapon', A),
      pK('married', A, C),
      pK('lovers', B, C)],
     [pP('dead', B)],
     template=['Shocked by the revelation that [0:his|her] [2:husband|wife] '
               'was cheating, {0} murdered [2:his|her] lover {1}'],
     fulfilment=300,
     sanity=-120)

rule('murder_money',
     [
         *alive(A),
         p('alive', B),
         pK('has_weapon', A),
         *greed(A),
         p('has_money', B)],
     [pP('dead', B), p('has_money', A)],
     template=['Down to [0:his|her] last shirt, {0} saw how much money {1} '
               'had. So [0:he|she] took [0:his|her] weapon and decided to '
               'make it all [0:his|hers]!'],
     fulfilment=100,
     sanity=-60)

rule('suicide',
     [
         p('alive', A),
         pK('has_weapon', A),
         *[pK('sadness', A)] * 3],
     [pP('dead', A)],
     template=['Depressed by the events, {0} took the final out and commited suicide.'],
     reset_rewards=True)

rule('grief',
     [
         *alive(A),
         p('dead', B),
         pK('trust', A, B)],
     [p('sadness', A)],
     template=['{0} was sad about the loss of {1}.'],
     sanity=20)

if __name__ == '__main__':
    characters, state = create_characters(4)
    s = Simulation(Evaluator(rules=rules, actors=characters, state=state))
    s.evaluator.verify_integrity()
    s.run(interactive=False, max_steps=100)
    s.print_graph(view=True, show_all=False)
