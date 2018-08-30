import random


class Simulation:
    def __init__(self, evaluator):
        self.evaluator = evaluator

    def run(self, interactive=False, max_steps=100):
        if interactive:
            while True:
                options = self.evaluator.step()
                if len(options) < 1:
                    print('No options, exiting')
                    break

                print('0: exit')
                for i in range(len(options)):
                    print('{}: {}'.format(str(i + 1), str(options[i])))
                number = int(input('Enter number: '))
                if number == 0:
                    break
                else:
                    options[number - 1].apply(self.evaluator)
        else:
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
                print(option)
                option.apply(self.evaluator)
                break

