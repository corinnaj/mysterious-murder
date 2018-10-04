import random
from .mcts import uct_find_best_rule


class Agent:
    def choose_action(self, actor, simulation):
        raise NotImplementedError


class RandomAgent:
    def choose_action(self, actor, simulation):
        options = simulation.get_actions_for_actor(actor)
        total_prob = sum(option.prob for option in options)
        target_prob = random.randrange(total_prob)
        current_prob = 0
        for option in options:
            current_prob += option.prob
            if current_prob >= target_prob:
                return option
        return options[len(options) - 1]


class MCTSAgent:
    def choose_action(self, actor, simulation):
        return uct_find_best_rule(simulation, actor,
                                  max_iterations=100,
                                  rollout_steps=10)
