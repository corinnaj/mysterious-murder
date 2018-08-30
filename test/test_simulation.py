import unittest
from unittest.mock import patch

from src.evaluator import (Evaluator, Predicate, Instance, Rule,
                           PredicateInstance)
from src.simulation import Simulation


class SimulationTestCase(unittest.TestCase):
    @patch('random.randint')
    def test_random_distribution(self, mocked_randint):
        simulation = Simulation(Evaluator(
            actors=[Instance('a')],
            rules=[
                Rule('rule1', [], [Predicate('p1', 0)], prob=1),
                Rule('rule2', [], [Predicate('p2', 0)], prob=4)]))

        mocked_randint.return_value = 1
        simulation.step()
        self.assertIn(PredicateInstance('p1', Instance('a')), simulation.evaluator.state)
        self.assertNotIn(PredicateInstance('p2', Instance('a')), simulation.evaluator.state)

        mocked_randint.return_value = 2
        simulation.step()
        self.assertIn(PredicateInstance('p1', Instance('a')), simulation.evaluator.state)
        self.assertIn(PredicateInstance('p2', Instance('a')), simulation.evaluator.state)

