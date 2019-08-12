from unittest.mock import patch

from src.evaluator import Evaluator, Predicate, Rule, PredicateInstance
from src.character import Character
from src.simulation import Simulation
from . import MyTestCase


class SimulationTestCase(MyTestCase):
    @patch('random.randrange')
    def test_random_distribution(self, mocked_randint):
        c = Character()
        simulation = Simulation(Evaluator(
            actors=[c],
            rules=[
                Rule('rule1', [], [Predicate('p1', 0)], prob=1),
                Rule('rule2', [], [Predicate('p2', 0)], prob=4)]))

        mocked_randint.return_value = 1
        simulation.step()
        self.assertStateContains(PredicateInstance('p1', c), simulation.evaluator)
        self.assertStateDoesNotContain(PredicateInstance('p2', c), simulation.evaluator)

        mocked_randint.return_value = 2
        simulation.step()
        self.assertStateContains(PredicateInstance('p1', c), simulation.evaluator)
        self.assertStateContains(PredicateInstance('p2', c), simulation.evaluator)

