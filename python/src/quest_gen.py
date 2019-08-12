from .evaluator import Predicate as P
from .evaluator import Evaluator
from .state_generator import create_characters
from .simulation import Simulation
from .agent import MCTSAgent
from .rule_helpers import rule, p, pK, pP, rules, A, B, C, P

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

# A spreads rumor about B to C
rule('lie_easy',
     [
         *alive(A, B, C),
         P('anger', A, B, keep=True),
         P('disgust', A, B, keep=True),
         trusting(C),
         trusting(C),
         P('trust', C, A, keep=True)
     ],
     (0.4, [P('disgust', C, B)]),
     (0.6, [P('disgust', C, A), P('anger', C, A)]),
     social=[30, -40],
     admit_probability=[0, 0],
     short_template=['{0} lied about {1} to {2}',
                     '{0} failed to lie about {1} to {2}'],
     template=['{0} told some dirty rumors about {1} to {2}.',
               '{0} tried to tell {2} lies about {1}, but {2} called '
               '[0:him|her] out on [0:his|her] lies!'])

rule('lie_difficult',
     [
         *alive(A, B, C),
         P('anger', A, B, keep=True),
         P('disgust', A, B, keep=True),
         suspicious(C),
         suspicious(C),
         P('trust', C, B, keep=True)
     ],
     (0.2, [P('disgust', C, B)]),
     (0.8, [P('disgust', C, A), P('anger', C, A)]),
     social=[30, -40],
     admit_probability=[0, 0],
     short_template=['{0} lied about {1} to {2}',
                     '{0} failed to lie about {1} to {2}'],
     template=['{0} told some dirty rumors about {1} to {2}.',
               '{0} tried to tell {2} lies about {1}, but {2} called '
               '[0:him|her] out on [0:his|her] lies!'])

rule('fight',
     [
         *alive(A, B),
         pK('anger', A, B)],
     [P('anger', B, A)],
     social=[-11],
     short_template=['{0} and {1} fought'],
     template=['{0} and {1} ended up fighting.'],
     admit_probability=[0.5])

rule('make_up',
     [
         *alive(A, B),
         P('anger', A, B),
         P('anger', B, A),
         P('trust', A, B, keep=True)],
     [],
     social=[12],
     template=['{0} and {1} made up.'])


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
     social=[70],
     template=['{0} seduced {1}.'])

rule('get_married',
     [
         *alive(A, B),
         *[P('trust', A, B, keep=True)] * 2,
         *[P('trust', B, A, keep=True)] * 2,
         P('single', A),
         P('single', B),
         P('not_related', A, B, keep=True),
         P('not_related', B, A, keep=True)],
     (0.9, [P('married', A, B), P('married', B, A)]),
     (0.1, [P('anger', A, B)]),
     template=['{0} and {1} got married!',
               '{0} proposed to {1} but got rejected!'],
     social=[40, -20],
     sanity=[10, -20],
     admit_probability=[1.0, 0.5])

rule('get_divorced',
     [
         *alive(A, B),
         *[P('disgust', B, A, keep=True)] * 3,
         P('married', A, B),
         P('married', B, A)],
     [
        P('single', A),
        P('single', B),
     ],
     template=['{0} and {1} got divorced.'],
     social=[-20],
     sanity=[40],
     admit_probability=[1.0])

rule('steal_N',
     [
        *alive(A, B),
        neutral(A),
        *greed(A),
        P('has_money', B),
        pK('disgust', A, B)],
     (0.3, [P('anger', B, A)] * 2),
     (0.7, [P('has_money', A)]),
     fulfilment=[-60, 80],
     sanity=[-10, -10],
     short_template=['{0} was caught stealing from {1}',
                     '{0} stole from {1}'],
     template=['{0} tried to steal from {1}, but {1} caught [0:him|her]!',
               '{0} managed to steal from {1}, unnoticed.'],
     admit_probability=[0.25, 0.1])

rule('steal_debt',
     [*alive(A, B), P('has_money', B), P('debt', A)],
     (0.3, [P('anger', B, A)] * 2),
     (0.7, [P('has_money', A)]),
     fulfilment=[-80, 120],
     sanity=[-10, -10],
     short_template=['{0} was caught stealing from {1}',
                     '{0} stole from {1}'],
     template=['{0} tried to steal from {1}, but {1} caught [0:him|her]!',
               '{0} managed to steal from {1}, unnoticed.'],
     admit_probability=[0.25, 0.1])

rule('steal_E',
     [
        *alive(A, B),
        evil(A),
        P('has_money', B)],
     (0.3, [P('anger', B, A)] * 2),
     (0.7, [P('has_money', A)]),
     fulfilment=[-20, 120],
     sanity=[-5, -5],
     short_template=['{0} was caught stealing from {1}',
                     '{0} stole from {1}'],
     template=['{0} tried to steal from {1}, but {1} caught [0:him|her]!',
               '{0} managed to steal from {1}, unnoticed.'],
     admit_probability=[0.25, 0.1])

rule('murder_anger',
     [
         *[p('anger', A, B)] * 3,
         *alive(A),
         p('alive', B)],
     [P('dead', B, permanent=True)],
     template=['In a fit of anger, {0} killed {1}.'],
     fulfilment=[300],
     sanity=[-80])

rule('murder_very_anger',
     [
         *[p('anger', A, B)] * 5,
         *alive(A),
         p('alive', B)],
     [P('dead', B, permanent=True)],
     fulfilment=[300],
     sanity=[-180],
     short_template=['{0} murdered {1} with bare hands'],
     template=['{0} got so angry, [0:he|she] murdered {1} with [0:his|her] '
               'bare hands!'])

rule('murder_cheating',
     [*alive(A, C),
      p('alive', B),
      pK('married', A, C),
      pK('lovers', B, C)],
     [pP('dead', B)],
     short_template=['{0} murdered {1}, the lover of [0:his|her] '
                     '[2:husband|wife] {2}'],
     template=['Shocked by the revelation that [0:his|her] [2:husband|wife] '
               'was cheating, {0} murdered [2:his|her] lover {1}'],
     fulfilment=[300],
     sanity=[-120])

rule('murder_money',
     [
         *alive(A),
         p('alive', B),
         *greed(A),
         p('has_money', B)],
     [pP('dead', B), p('has_money', A)],
     short_template=['{0} murdered {1} for their money'],
     template=['Down to [0:his|her] last shirt, {0} saw how much money {1} '
               'had. So [0:he|she] took [0:his|her] weapon and decided to '
               'make it all [0:his|hers]!'],
     fulfilment=[100],
     sanity=[-60])

rule('suicide',
     [
         p('alive', A),
         *[pK('sadness', A)] * 3],
     [pP('dead', A)],
     short_template=['{0} committed suicide'],
     template=['Endlessly depressed by the events, {0} committed suicide.'],
     reset_rewards=True)

rule('hire NPCs to solve murder',
     [
         *alive(A),
         p('dead', B),
         *[pK('trust', A, B)] * 3],
     [p('sadness', A)],
     template=['{0} was sad about the loss of {1}, and decided to hire your party to solve it.'],
     sanity=[20],
     admit_probability=[1.0])

rule('pay_debt',
     [*alive(A), P('has_money', A), P('debt', A)],
     [],
     template=['{0} paid off [0:his|her] debt.'],
     sanity=[40],
     admit_probability=[1.0])

rule('gamble',
     [
         *alive(A),
     ],
     (0.1, [P('has_money', A)]),
     (0.9, [P('debt', A)]),
     template=['{0} won big time in the casino!',
               '{0} tried their luck in the casino, but to no avail'],
     fulfilment=[100, -30],
     admit_probability=[0.95, 0.6])

rule('threaten',
        [*alive(A, B), pK('debt', B)],
        [*[P('suspicious', B)] * 2, *[P('anger', B, A)] * 2],
        template=['{0} set some hired thugs on {1} because [1:he|she] owed [0:him|her] money.'],
        admit_probability=[0.5])

rule('hide artifact',
        [*alive(A), P('has_money', A), pK('suspicious', A)],
        [],
        template=['{0} was scared someone would take his money, so he hid it in the woods.'])

rule('hire NPCs out of paranoia',
        [*alive(A), *[pK('suspicious', A)] * 3],
        [],
        template=['Afraid that someone might harm [0:him|her], {0} hired your party for protection.'])

rule('hire NPCs to for protection',
        [*alive(A, B), *[pK('anger', B, A)] * 3],
        [],
        template=['Afraid of {1}s anger, {0} hired your party for protection.'])

rule('hire NPCs to settle debt',
        [*alive(A), *[pK('debt', A)] * 2, *[pK('anger', B, A)] * 2],
        [],
        template=['Unable to pay back the money [0:he|she] owed and afraid of {1}s anger, {0} decided to hire your party'])

rule('hire NPCs to clear name',
        [*alive(A, B, C), *[pK('disgust', B, A)] * 2, *[pK('disgust', C, A)] * 3],
        [],
        template=['{0} hired your party to help clear his name'])

rule('skip',
        [pK('dead', A)],
        [],
        template=[])

class QuestGenSimulation(Simulation):
    def __init__(self, evaluator, agent=MCTSAgent(), log=False):
        super(QuestGenSimulation, self).__init__(evaluator, agent=agent, log=log)

    def check_stop(self, option):
        return 'hire NPCs' in option.rule.name or 'hide' in option.rule.name


if __name__ == '__main__':
    characters, state = create_characters(4)
    evaluator = Evaluator(rules=rules, actors=characters, state=state)
    evaluator.verify_integrity()

    s = QuestGenSimulation(evaluator,
                           agent=MCTSAgent(),
                           log=True)
    s.run(interactive=False, max_steps=100)
    s.print_graph(view=True, show_all=False)
    for c in characters:
        print(c.full_name)
        c.get_admitted_events(s.evaluator)
        print('\n')

