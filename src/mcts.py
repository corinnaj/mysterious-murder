from math import log, sqrt
import random

class Node:
    EPSILON = 30

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
        return sorted(self.children, key=lambda c:
                      c.accum_score/c.visits +
                      self.EPSILON * sqrt(2*log_visits/c.visits))[-1]

    def uct_select_next(self):
        if self.has_untried_rules():
            return self
        if len(self.children) < 1:
            return None
        return self.uct_select_child().uct_select_next()

    def has_untried_rules(self):
        return len(self.untried_rules) > 0

    def has_children(self):
        return len(self.children) > 0

    def create_random_child_state(self):
        rule_instance = random.choice(self.untried_rules)
        simulation = self.simulation.copy()
        simulation.take_action(self.actor, rule_instance)

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
            simulation.take_action(self.actor, random.choice(rule_instances))

    def update(self, score):
        self.accum_score += score
        self.visits += 1

    def get_score(self):
        return self.simulation.get_score_for_actor(self.actor)

    def print_score(self):
        return str(self.accum_score) + '/' + str(self.visits)


def uct_find_best_rule(simulation,
                       actor,
                       max_iterations=1000,
                       rollout_steps=30):
    root = Node(simulation=simulation, actor=actor)

    for _ in range(max_iterations):
        node = root.uct_select_next()
        if not node:
            continue
        node = node.create_random_child_state()
        if not node:
            continue
        node.do_rollout(rollout_steps)

        score = node.get_score()
        while True:
            node.update(score)
            if node.parent:
                node = node.parent
            else:
                break

    return max(root.children, key=lambda n: n.visits).rule_instance
