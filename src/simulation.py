import random


class Simulation:
    def __init__(self, evaluator):
        self.evaluator = evaluator

    def run(self, max_steps=100):
        for _ in range(max_steps):
            self.step()

    def calculate_reward(self):
        pass

    def step(self):
        options = self.evaluator.step()

        total_prob = sum(option.prob for option in options)
        target_prob = random.randint(0, total_prob - 1)
        current_prob = 0
        for option in options:
            current_prob += option.prob
            if current_prob >= target_prob:
                option.apply(self.evaluator)
                break

