import random
from .agent import RandomAgent
from .evaluator import Evaluator


class Simulation:
    def __init__(self, evaluator: Evaluator, agent=RandomAgent(), log=False):
        self.evaluator = evaluator
        self.agent = agent
        self.log = log
        self.murder = None
        self.murderers = []

    def copy(self):
        s = Simulation(self.evaluator.copy())
        s.murderers = self.murderers[:]
        return s

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

    def get_score_for_actor(self, actor):
        # better look up the proper actor instance again, we might have
        # diverged during copying
        a = next(a for a in self.evaluator.actors if a == actor)
        return a.calculate_score()

    def count_alive_actors(self):
        count = 0
        for a in self.evaluator.actors:
            if self.evaluator.state.contains('alive', [a]):
                count += 1
        return count

    def check_is_murderer(self, actor):
        return actor in self.murderers

    def get_murderers(self):
        return self.murderers

    def check_stop(self, option):
        # if self.count_alive_actors() < 3:
        #     print('Too few actors remaining')
        #     return True
        # return False
        if 'murder' in option.rule.name:
            self.murderers.append(option.actors[0])
            self.murder = option
            return True
        return False

    def print_murder_causality(self):
        self.print_causality(self.murder)

    def get_actions_for_actor(self, actor):
        options = self.evaluator.step()
        return [option for option in options
                if option.actors[0] == actor]

    def whose_turn(self):
        return random.choice(self.evaluator.actors)

    def take_action(self, actor, rule_instance):
        rule_instance.apply(self.evaluator, record=False, rewards=True)

    def step(self):
        next_actor = self.whose_turn()

        option = self.agent.choose_action(next_actor, self)
        # next_actor.update_scales(option.rule)
        option.apply(self.evaluator, record=True, rewards=True)
        self.random_witness(option)
        if self.log:
            print(option.story_print())
            self.print_reward_state()
        # self.print_causality(option)
        # print(option.actors[0].relationship_to(option.actors[1],
        #                                       self.evaluator.state))
        return not self.check_stop(option)

    def random_witness(self, rule_instance):
        if random.random() <= rule_instance.rule.witness_probability:
            witness = random.choice([a for a in self.evaluator.actors
                                     if a not in rule_instance.actors])
            print("Witness! " + str(rule_instance) + " " + str(witness))
            witness.witness(rule_instance)

    def print_graph(self, view=True, show_all=False):
        return self.evaluator.print_graph(view=view, show_all=show_all)

    def print_causality(self, root):
        self.evaluator.traverse_tree(root,
                                     lambda rule: print(rule.story_print()))

    def print_reward_state(self):
        print('--------------------')
        print(' \tsocial\tfulfilm\tsanity\tSCORE')
        for c in self.evaluator.actors:
            c.print_reward_state()
        print('--------------------')
        print()
