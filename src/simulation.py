import random


class Node:
    def __init__(self, data, type):
        self.data = data
        self.type = type
        self.points_to = []

    def points_to(self, obj):
        self.points_to.append(obj)


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
                if not self.step():
                    return

    def calculate_reward(self):
        pass

    def step(self):
        options = self.evaluator.step()
        if len(options) < 1:
            print('No options, exiting')
            return False

        total_prob = sum(option.prob for option in options)
        target_prob = random.randint(0, total_prob - 1)
        current_prob = 0
        for option in options:
            current_prob += option.prob
            if current_prob >= target_prob:
                #print(option)
                print(option.story_print())
                option.apply(self.evaluator)
                break
        return True

