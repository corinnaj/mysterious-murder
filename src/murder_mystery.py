from evaluator import Predicate as P
from evaluator import Rule, Evaluator
from state_generator import create_characters
from simulation import Simulation

A = 0
B = 1
C = 2

rules = []
def rule(name, lhs, rhs, keep=False):
    rules.append(Rule(name, lhs, rhs, keep))

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


rule('get_weapon', [], [P('has_weapon', 0)])

# A spreads rumor about B to C
rule('lie_success',
        [
            P('anger', A, B, keep=True),
            P('disgust', A, B, keep=True),
            trusting(C),
            trusting(C),
            P('trust', C, A, keep=True)
        ],
        [P('disgust', C, B)])

rule('lie_success',
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
        ])



rule('seduce',
        [
            P('attraction', A, B, keep=True),
            P('attraction', B, A, keep=True),
            P('not_related', A, B, keep=True),
            P('not_related', B, A, keep=True)],
        [
            P('lovers', A, B),
            P('lovers', B, A)])

rule('get_married',
        [
            *[P('trust', A, B, keep=True)] * 3,
            *[P('trust', B, A, keep=True)] * 3,
            P('not_related', A, B, keep=True),
            P('not_related', B, A, keep=True)],
        [
            P('married', A, B),
            P('married', B, A)])

rule('get_divorced',
        [
            *[P('disgust', B, A, keep=True)] * 3,
            P('married', A, B),
            P('married', B, A)],
        [])

rule('steal_not_caught_E',
    [
        evil(A),
        P('has_money', B)],
    [
        P('has_money', A)])

rule('steal_not_caught_N',
    [
        neutral(A),
        *greed(A),
        P('has_money', B),
        P('disgust', A, B, keep=True)],
    [
        P('has_money', A)])

rule('steal_caught_E',
    [
        evil(A),
        P('has_money', B)],
    [
        P('anger', B, A)] * 3)

rule('steal_caught_N',
    [
        neutral(A),
        *greed(A),
        P('has_money', B),
        P('disgust', A, B, keep=True)],
    [
         P('anger', B, A)] * 3)

if __name__ == '__main__':
    characters, state = create_characters(4)
    s = Simulation(Evaluator(rules=rules, actors=characters, state=state))
    s.run(interactive=True, max_steps=100)
