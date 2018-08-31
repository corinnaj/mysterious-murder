from evaluator import Predicate as P
from evaluator import Rule, Evaluator
from state_generator import create_characters
from simulation import Simulation

A = 0
B = 1
C = 2

rules = []
def rule(name, lhs, rhs, prob=5, template=[]):
    rules.append(Rule(name, lhs, rhs, prob=prob, template=template))

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


rule('get_weapon', [], [P('has_weapon', 0)], template=['{0} acquired a weapon.'])

# A spreads rumor about B to C
rule('lie_success',
        [
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
            P('anger', A, B, keep=True),
            P('disgust', A, B, keep=True),
            suspicious(C),
            suspicious(C),
            P('trust', C, B, keep=True)
        ],
        [
            P('disgust', C, A),
            P('anger', C, A)
        ], template=['{0} tried to tell {1} lies about {2}, but got caught redhanded!'])

rule('fight',
        [P('anger', A, B, keep=True)],
        [P('anger', B, A)],
        template=['{0} and {1} ended up fighting.'])

rule('make_up',
        [
            P('anger', A, B),
            P('anger', B, A),
            P('trust', A, B, keep=True)],
        [], template=['{0} and {1} made up.'])


rule('seduce',
        [
            P('attraction', A, B, keep=True),
            P('attraction', B, A, keep=True),
            P('not_related', A, B, keep=True),
            P('not_related', B, A, keep=True)],
        [
            P('lovers', A, B),
            P('lovers', B, A)],
        template=['{0} seduced {1}.'])

#TODO check if they are already married
rule('get_married',
        [
            *[P('trust', A, B, keep=True)] * 2,
            *[P('trust', B, A, keep=True)] * 2,
            P('not_related', A, B, keep=True),
            P('not_related', B, A, keep=True)],
        [
            P('married', A, B),
            P('married', B, A)],
        template=['{0} and {1} got married!'])

rule('get_divorced',
        [
            *[P('disgust', B, A, keep=True)] * 3,
            P('married', A, B),
            P('married', B, A)],
        [],
        template=['{0} and {1} got divorced.'])

rule('steal_not_caught_E',
    [
        evil(A),
        P('has_money', B)],
    [
        P('has_money', A)],
    template=['{0} managed to steal from {1}, unnoticed.'])

rule('steal_not_caught_N',
    [
        neutral(A),
        *greed(A),
        P('has_money', B),
        P('disgust', A, B, keep=True)],
    [P('has_money', A)],
    template=['{0} managed to steal from {1}, unnoticed.'])

rule('steal_caught_E',
    [
        evil(A),
        P('has_money', B)],
    [P('anger', B, A)] * 2,
    template=['{0} tried to steal from {1}, but {1} caught [0:him|her]!'])

rule('steal_caught_N',
    [
        neutral(A),
        *greed(A),
        P('has_money', B),
        P('disgust', A, B, keep=True)],
    [P('anger', B, A)] * 2,
    template=['{0} tried to steal from {1}, but {1} caught [0:him|her]!'])

if __name__ == '__main__':
    characters, state = create_characters(4)
    s = Simulation(Evaluator(rules=rules, actors=characters, state=state))
    s.run(interactive=False, max_steps=100)
    s.print_graph(view=True, show_all=False)
