from .evaluator import Predicate as P
from .evaluator import Evaluator
from .state_generator import create_characters
from .simulation import Simulation
from .agent import MCTSAgent
from .rule_helpers import rule, p, pK, pP, rules, A, B, C, P


class QuestGenSimulation(Simulation):
    def __init__(self, evaluator, agent=MCTSAgent(), log=False):
        super(QuestGenSimulation, self).__init__(evaluator, agent=agent, log=log)

    def check_stop(self, option):
        return 'murder' in option.rule.name or 'suicide' in option.rule.name


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

