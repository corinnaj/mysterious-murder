from math import log, sqrt
from .state import Simulation, RuleInstance, Actor
import random


class Node:

    def __init__(self,
                 rule_instance: RuleInstance = None,
                 parent: 'Node' = None,
                 actor: Actor = None,
                 state: Simulation = None):
        self.children = []
        self.actor = actor
        self.rule_instance = rule_instance
        self.parent = parent
        self.state = state
        self.visits = 0
        self.accum_score = 0
        self.untried_rules = state.get_actions_for_actor(actor)

    def uct_select_child(self):
        log_visits = log(self.visits)
        return sorted(self.children, key=lambda c:
                      c.accum_score/c.visits + sqrt(2*log_visits/c.visits))[-1]

    def has_untried_rules(self):
        return len(self.untried_rules) > 0

    def has_children(self):
        return len(self.children) > 0

    def get_random_child_state(self):
        rule_instance = random.choice(self.children)
        state = self.state.copy()
        rule_instance.apply(state)
        self.untried_rules.remove(rule_instance)
        return Node(rule_instance=rule_instance,
                    parent=self,
                    state=state,
                    actor=self.actor)

    def do_rollout(self, rollout_steps):
        for _ in range(rollout_steps):
            rule_instances = self.state.get_actions_for_actor(self.actor)
            random.choice(rule_instances).apply(self.state)

    def update(self, score):
        self.accum_score += score

    def get_state_score(self):
        return 0


def uct_find_best_rule(simulation,
                       actor,
                       max_iterations=1000,
                       rollout_steps=30):
    root = Node(state=simulation, actor=actor)

    for _ in range(max_iterations):
        node = root

        # select
        while not node.has_untried_rules() and node.has_children():
            node = node.uct_select_child()

        # expand
        node = node.get_random_child_state()

        # simulate
        node.do_rollout(rollout_steps)

        # backpropagate
        score = node.get_score()
        while node:
            node = node.parent
            node.update(score)

    return max(root.children, key=lambda n: n.visits).rule_instance
