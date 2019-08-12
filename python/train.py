import gym
from baselines import deepq

from src.learn import SimulationGym


def callback(lcl, _glb):
    is_solved = (lcl['t'] > 100 and
                 sum(lcl['episode_rewards'][-101:-1]) / 100 >= 199)
    return is_solved


def main():
    model = deepq.models.mlp([128], layer_norm=True)
    act = deepq.learn(
        SimulationGym(),
        lr=1e-6,
        q_func=model,
        max_timesteps=6000000,
        print_freq=10,
        param_noise=True,
        # callback=callback,
        # buffer_size=50000,
        # exploration_fraction=0.1,
        # exploration_final_eps=0.1,
    )
    print('Saving model to test_model.pkl')
    act.save('test_model.pkl')


if __name__ == '__main__':
    main()
