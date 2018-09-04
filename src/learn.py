import numpy as np
import gym
from gym import spaces
import random

from .evaluator import Evaluator
from .state_generator import create_characters
from .agent import RandomAgent
from .murder_mystery import rules
from .simulation import Simulation


class SimulationGym(gym.Env):
    NUM_ACTORS = 4
    MAX_ACTORS_PER_RULE = 3
    MAX_ACTIONS = 20

    def __init__(self):
        self.build_simulation()
        self.action_space = spaces.Discrete(self.MAX_ACTIONS)

        low = np.array(([0] + [0] * self.MAX_ACTORS_PER_RULE) * self.MAX_ACTIONS)
        high = np.array(([len(rules)] +
            [self.NUM_ACTORS + 1] * self.MAX_ACTORS_PER_RULE) * self.MAX_ACTIONS)

        self.observation_space = spaces.Box(low=low, high=high, dtype=np.uint32)
        print(self.observation_space)

    def build_simulation(self):
        actors, state = create_characters(self.NUM_ACTORS)
        self.simulation = Simulation(Evaluator(actors=actors,
                                               state=state,
                                               rules=rules))

        self.character_mapping = {actors[i]: i + 1 for i in range(len(actors))}
        self.my_actor = random.sample(actors, 1)[0]

        rules_names = self.simulation.evaluator.get_rule_names()
        self.rule_mapping = {rules_names[i]: i + 1 for i in range(len(rules))}

    def step(self, action):
        reward = 0
        if action < len(self.options):
            reward = -1000
            print('Failed pick ' + str(action))
            self.options[action].apply(self.simulation.evaluator)
        else:
            print('Success pick '+ str(action))
        self.advance_until_my_turn()
        observation = self.build_observation()

        done = False
        return observation, reward, done, {}

    def build_observation(self):
        """
        build observation based on our options and store the result
        in our options field, so that we can apply the next step
        """
        self.options = self.simulation.get_actions_for_actor(self.my_actor)
        # actions = [[0] * (self.MAX_ACTORS_PER_RULE + 1)] * self.MAX_ACTIONS
        actions = [0] * (self.MAX_ACTORS_PER_RULE + 1) * self.MAX_ACTIONS
        for i in range(min(len(self.options), self.MAX_ACTIONS)):
            self.options[i].store_observation(self.character_mapping,
                                              self.rule_mapping,
                                              actions,
                                              i * (self.MAX_ACTORS_PER_RULE + 1))
        return np.array(actions, dtype=np.uint32)

    def reset(self):
        self.build_simulation()
        self.advance_until_my_turn()
        return self.build_observation()

    def advance_until_my_turn(self):
        next_actor = self.simulation.whose_turn()
        while next_actor != self.my_actor:
            options = self.simulation.get_actions_for_actor(next_actor)
            option = RandomAgent().choose_action(options, self)
            option.apply(self.simulation.evaluator)
            next_actor = self.simulation.whose_turn()

    def render(self, mode='human', close=False):
        pass
