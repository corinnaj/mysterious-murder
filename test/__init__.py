import unittest


class MyTestCase(unittest.TestCase):
    def assertStateContains(self, search, evaluator):
        self.assertTrue(self.stateContains(search, evaluator))

    def assertStateDoesNotContain(self, search, evaluator):
        self.assertFalse(self.stateContains(search, evaluator))

    def stateContains(self, search, evaluator):
        return len(evaluator.state.fetch(search.name, search.actors)) >= 1
        # for instance in evaluator.state:
        #    if (search.name == instance.name and
        #        len(search.actors) == len(instance.actors) and
        #        all(search.actors[i] == instance.actors[i]
        #            for i in range(len(search.actors)))):
        #        return True
        # return False

