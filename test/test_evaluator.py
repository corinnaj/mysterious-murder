import unittest
from src.evaluator import (Instance, Evaluator, Rule, Predicate,
                           PredicateInstance, RuleInstance)
from . import MyTestCase


class EvaluatorTestCase(MyTestCase):
    def test_empty_lhs(self):
        eval = Evaluator(
            actors=[Instance('a'), Instance('b')],
            rules=[Rule('make_friends', [], [Predicate('friends', 0, 1)])])
        options = eval.step()
        self.assertIn(eval.rules[0].instance([Instance('a'), Instance('b')]), options)
        options[0].apply(eval)
        self.assertEqual(len(eval.state), 1)

    def test_empty_rhs(self):
        eval = Evaluator(
            actors=[Instance('a')],
            state=[PredicateInstance('happy', Instance('a'))],
            rules=[Rule('time_passes', [Predicate('happy', 0)], [])])
        options = eval.step()
        self.assertIn(eval.rules[0].instance([Instance('a')]), options)
        options[0].apply(eval)
        self.assertEqual(len(eval.state), 0)

    def test_simple_lhs(self):
        eval = Evaluator(
            actors=[Instance('a'), Instance('b')],
            rules=[Rule('make_friends', [Predicate('likes', 0, 1)], [Predicate('likes', 0, 1)])])
        self.assertNotIn(eval.rules[0].instance([Instance('a'), Instance('b')]), eval.step())
        eval.state.append(PredicateInstance('likes', Instance('a'), Instance('b')))
        self.assertIn(eval.rules[0].instance([Instance('a'), Instance('b')]), eval.step())

    def test_predicate_indices(self):
        eval = Evaluator(
            state=[PredicateInstance('likes', Instance('a'), Instance('b'))],
            actors=[Instance('a'), Instance('b')],
            rules=[Rule('make_friends',
                        [Predicate('likes', 0, 1)],
                        [Predicate('friends', 1, 0)])])
        eval.step()[0].apply(eval)
        self.assertStateContains(PredicateInstance('friends', Instance('b'), Instance('a')), eval)

    def test_get_n_actors(self):
        self.assertEqual(Rule('recommend',
                              [Predicate('likes', 0, 1), Predicate('likes', 0, 2)],
                              [Predicate('friends', 1, 2)]).get_n_actors(), 3)
        self.assertEqual(Rule('recommend',
                              [Predicate('likes', 0, 1)],
                              [Predicate('friends', 0, 1)]).get_n_actors(), 2)
        self.assertEqual(Rule('recommend',
                              [Predicate('likes', 0)],
                              [Predicate('friends', 0)]).get_n_actors(), 1)
        self.assertEqual(Rule('recommend',
                              [],
                              [Predicate('friends', 0)]).get_n_actors(), 1)
        self.assertEqual(Rule('recommend',
                              [],
                              [Predicate('friends', 0, 1)]).get_n_actors(), 2)

    def test_three_actors(self):
        eval = Evaluator(
            actors=[Instance('a'), Instance('b'), Instance('c')],
            state=[
                PredicateInstance('likes', Instance('a'), Instance('b')),
                PredicateInstance('likes', Instance('a'), Instance('c'))],
            rules=[Rule('recommend',
                        [Predicate('likes', 0, 1), Predicate('likes', 0, 2)],
                        [Predicate('friends', 1, 2)])])
        options = eval.step()
        self.assertEqual(len(options), 2)
        options[0].apply(eval)
        self.assertStateContains(PredicateInstance('friends', Instance('b'), Instance('c')), eval)

    def test_predicate_consumed(self):
        eval = Evaluator(
            actors=[Instance('a')],
            state=[PredicateInstance('happy', Instance('a'))],
            rules=[Rule('time_passes', [Predicate('happy', 0)], [])])
        eval.step()[0].apply(eval)
        self.assertEqual(len(eval.state), 0)

    def test_predicate_keep(self):
        eval = Evaluator(
            actors=[Instance('a')],
            state=[PredicateInstance('happy', Instance('a'))],
            rules=[Rule('time_passes', [Predicate('happy', 0, keep=True)], [])])
        eval.step()[0].apply(eval)
        self.assertEqual(len(eval.state), 1)

    def test_swap(self):
        eval = Evaluator(
                actors=[Instance('a'), Instance('b')],
                state=[PredicateInstance('has_money', Instance('a'))],
                rules=[Rule('give_money', [Predicate('has_money', 0)], [Predicate('has_money', 1)])])
        eval.step()[0].apply(eval)
        self.assertStateContains(PredicateInstance('has_money', Instance('b')), eval)

    def test_multiple_required(self):
        eval = Evaluator(
            actors=[Instance('a')],
            state=[
                PredicateInstance('confident', Instance('a')),
                PredicateInstance('confident', Instance('a'))],
            rules=[Rule('awkward_incidence',
                        [Predicate('confident', 0), Predicate('confident', 0)],
                        [])])
        eval.step()[0].apply(eval)
        self.assertEqual(len(eval.state), 0)

    def test_multiple_available(self):
        eval = Evaluator(
            actors=[Instance('a')],
            state=[
                PredicateInstance('confident', Instance('a')),
                PredicateInstance('confident', Instance('a'))],
            rules=[Rule('less_awkward_incidence',
                        [Predicate('confident', 0)],
                        [])])
        eval.step()[0].apply(eval)
        self.assertEqual(len(eval.state), 1)

    def test_rule_story_print(self):
        c0 = Instance('alice', 'Alice', 'female')
        c1 = Instance('bob', 'Bob', 'male')
        r = RuleInstance(
                Rule('test', [Predicate('steal', 0, 1)], [], template=['{0} tried to steal from {1}, but {1} caught [0:him|her]!. [1:He|She]']),
                [c0, c1], [])
        self.assertEqual(r.story_print(), 'Alice tried to steal from Bob, but Bob caught her. He')


if __name__ == '__main__':
    unittest.main()

