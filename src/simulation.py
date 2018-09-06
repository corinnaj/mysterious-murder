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

    def count_alive_actors(self):
        count = 0
        for a in self.evaluator.actors:
            if self.evaluator.state.contains('alive', [a]):
                count += 1
        return count

    def check_stop(self, option):
        # if self.count_alive_actors() < 3:
        #     print('Too few actors remaining')
        #     return True
        # return False
        return 'murder' in option.rule.name

    def get_actions_for_actor(self, actor):
        options = self.evaluator.step()
        options = [option for option in options
                   if option.actors[0] == actor]
        return options

    def whose_turn(self):
        return random.sample(self.evaluator.actors, 1)[0]

    def step(self):
        next_actor = self.whose_turn()
        options = self.get_actions_for_actor(next_actor)
        if len(options) < 1:
            return True
        option = RandomAgent().choose_action(options, self)
        option.apply(self.evaluator)
        # print(option.story_print())
        if self.check_stop(option):
            self.print_causality(option)
            return False
        else:
            return True

    def print_graph(self, view=True, show_all=False):
        return self.evaluator.print_graph(view=view, show_all=show_all)

    def print_causality(self, root):
        self.evaluator.traverse_tree(root,
                                     lambda rule: print(rule.story_print()))
