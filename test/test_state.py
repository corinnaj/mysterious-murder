import unittest
from src.state import State, StateAccess
from src.evaluator import PredicateInstance, Instance, Evaluator
from . import MyTestCase


class StateTestCase(MyTestCase):
    def test_store_and_access(self):
        s = State()
        p = PredicateInstance('happy', Instance('a'))
        s.append(p)

        self.assertEqual([p], s.fetch('happy', [Instance('a')]))
        self.assertStateContains(PredicateInstance('happy', Instance('a')),
                                 Evaluator(state=s))

    def test_store_multiple(self):
        s = State()
        s.append(PredicateInstance('happy', Instance('a')))
        s.append(PredicateInstance('unhappy', Instance('a')))
        self.assertStateContains(PredicateInstance('happy', Instance('a')),
                                 Evaluator(state=s))
        self.assertStateContains(PredicateInstance('unhappy', Instance('a')),
                                 Evaluator(state=s))

    def test_access_missing(self):
        s = State()
        self.assertEqual(s.fetch('happy', [Instance('a')]), [])

    def test_state_access(self):
        s = State([PredicateInstance('happy', Instance('a')),
                   PredicateInstance('happy', Instance('a')),
                   PredicateInstance('happy', Instance('a'))])
        a = StateAccess(state=s)
        self.assertIsNotNone(a.fetch('happy', [Instance('a')]))
        self.assertIsNotNone(a.fetch('happy', [Instance('a')]))
        self.assertIsNotNone(a.fetch('happy', [Instance('a')]))
        self.assertIsNone(a.fetch('happy', [Instance('a')]))
        self.assertIsNone(a.fetch('happy', [Instance('a')]))


if __name__ == '__main__':
    unittest.main()

