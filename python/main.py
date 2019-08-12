from src.murder_mystery import rules
from src.evaluator import Evaluator
from src.state_generator import create_characters
from src.simulation import Simulation
from src.agent import MCTSAgent

# import cProfile
# pr = cProfile.Profile()
# pr.enable()

characters, state = create_characters(4)
s = Simulation(Evaluator(rules=rules, actors=characters, state=state),
               agent=MCTSAgent(),
               log=True)
# s.evaluator.verify_integrity()
s.run(interactive=False, max_steps=100)
s.print_graph(view=True, show_all=False)

# pr.disable()
# pr.print_stats(sort='time')
