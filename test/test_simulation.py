import unittest
from unittest.mock import patch

from src.evaluator import (Evaluator, Predicate, Instance, Rule,
                           PredicateInstance)
from src.simulation import Simulation
from . import MyTestCase


class SimulationTestCase(MyTestCase):
    @patch('random.randint')
    def test_random_distribution(self, mocked_randint):
        simulation = Simulation(Evaluator(
            actors=[Instance('a')],
            rules=[
                Rule('rule1', [], [Predicate('p1', 0)], prob=1),
                Rule('rule2', [], [Predicate('p2', 0)], prob=4)]))

        mocked_randint.return_value = 1
        simulation.step()
        self.assertStateContains(PredicateInstance('p1', Instance('a')), simulation.evaluator)
        self.assertStateDoesNotContain(PredicateInstance('p2', Instance('a')), simulation.evaluator)

        mocked_randint.return_value = 2
        simulation.step()
        self.assertStateContains(PredicateInstance('p1', Instance('a')), simulation.evaluator)
        self.assertStateContains(PredicateInstance('p2', Instance('a')), simulation.evaluator)

