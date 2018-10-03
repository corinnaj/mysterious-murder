from math import log, sqrt
import random


class Node:

    def __init__(self, rule_instance=None, parent=None, actor=None,
                 simulation=None):
        self.children = []
        self.actor = actor
        self.rule_instance = rule_instance
        self.parent = parent
        self.simulation = simulation
        self.visits = 0
        self.accum_score = 0
        self.untried_rules = simulation.get_actions_for_actor(actor)

    def uct_select_child(self):
        log_visits = log(self.visits)
        return sorted([c for c in self.children],
                      key=lambda c:
                      c.accum_score/c.visits + sqrt(2*log_visits/c.visits))[-1]

    def uct_select_next(self):
        if self.has_untried_rules():
            return self
        return self.uct_select_child().uct_select_next()

    def has_untried_rules(self):
        return len(self.untried_rules) > 0

    def has_children(self):
        return len(self.children) > 0

    def create_random_child_state(self):
        rule_instance = random.choice(self.untried_rules)
        simulation = self.simulation.copy()
        rule_instance.apply(simulation.evaluator)

        self.untried_rules.remove(rule_instance)
        n = Node(rule_instance=rule_instance,
                 parent=self,
                 simulation=simulation,
                 actor=self.actor)
        self.children.append(n)
        return n

    def do_rollout(self, rollout_steps):
        simulation = self.simulation.copy()
        for _ in range(rollout_steps):
            rule_instances = simulation.get_actions_for_actor(self.actor)
            if len(rule_instances) < 1:
                break
            random.choice(rule_instances).apply(simulation.evaluator)

    def update(self, score):
        self.accum_score += score
        self.visits += 1

    def get_score(self):
        return self.simulation.get_score_for_actor(self.actor)


def uct_find_best_rule(simulation,
                       actor,
                       max_iterations=1000,
                       rollout_steps=30):
    root = Node(simulation=simulation, actor=actor)

    for _ in range(max_iterations):
        node = root.uct_select_next().create_random_child_state()
        node.do_rollout(rollout_steps)

        score = node.get_score()
        while True:
            node.update(score)
            if node.parent:
                node = node.parent
            else:
                break

    return max(root.children, key=lambda n: n.visits).rule_instance
