import random


class Agent:
    def choose_action(self, options, simulation):
        raise NotImplementedError


class RandomAgent:
    def choose_action(self, options, simulation):
        total_prob = sum(option.prob for option in options)
        target_prob = random.randrange(total_prob)
        current_prob = 0
        for option in options:
            current_prob += option.prob
            if current_prob >= target_prob:
                return option
        return options[len(options) - 1]

