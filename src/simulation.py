import random
from .agent import RandomAgent
from .evaluator import Evaluator


class Node:
    def __init__(self, data, type):
        self.data = data
        self.type = type
        self.points_to = []

    def points_to(self, obj):
        self.points_to.append(obj)


class Simulation:
    def __init__(self, evaluator: Evaluator):
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

    def check_stop(self, option):
        return False
        # return 'murder' in option.rule.name

    def get_actions_for_actor(self, actor):
        options = self.evaluator.step()
        if len(options) < 1:
            print('No options, exiting')
            return False

        options = [option for option in options
                   if option.actors[0] == actor]
        assert len(options) > 0
        return options

    def whose_turn(self):
        return random.sample(self.evaluator.actors, 1)[0]

    def step(self):
        next_actor = self.whose_turn()
        options = self.get_actions_for_actor(next_actor)
        option = RandomAgent().choose_action(options, self)
        option.apply(self.evaluator)
        return True

    def print_graph(self, view=True, show_all=False):
        return self.evaluator.print_graph(view=view, show_all=show_all)

