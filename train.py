import gym
from baselines import deepq

from src.learn import SimulationGym


def callback(lcl, _glb):
    # stop training if reward exceeds 199
    is_solved = lcl['t'] > 100 and sum(lcl['episode_rewards'][-101:-1]) / 100 >= 199
    return is_solved


def main():
    model = deepq.models.mlp([128], layer_norm=True)
    act = deepq.learn(
        SimulationGym(),
        q_func=model,
        #lr=1e-3,
        #max_timesteps=100000,
        #buffer_size=50000,
        #exploration_fraction=0.1,
        #exploration_final_eps=0.1,
        #print_freq=10,
        #param_noise=True
    )
    print("Saving model to cartpole_model.pkl")
    act.save("cartpole_model.pkl")


if __name__ == '__main__':
    main()
