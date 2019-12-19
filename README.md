# Mysterious Murder
A murder mystery generator using the concepts found in Ceptre and MCTS agents.  
You can play a web version of the game [here.](https://corinnaj.github.io/mysterious-murder/)

## Implementation
This project was originally written in Python using a Kivy-based UI.
The core was later rewritten in Rust, so it could compile to WebAssembly and run as a browser-based game.

So, for the most up-to-date version, refer to the rust folder.
For a potentially easier to follow version, have a look into the python folder.

## Paper
This project was developed in the course of a university project at the University of Technology Sydney. We published a paper about it at the IEEE Conference on Games 2019.

### Abstract
  We present an approach to procedurally generate the narrative of a simple murder mystery.
  As a basis for the simulation, we use a rule evaluation system inspired by *Ceptre*, which employs linear logic to resolve valid actions during each step of the simulation.
  We extend Ceptre's system with a concept of believable agents to make consecutive actions appear to have a causal connection so that players can comprehend the flow of events.
  The parts of the generated narratives are then presented to a player whose task it is to figure out who the murderer in this story could have been. Rather than aiming to replace highly authored narratives, this project generates puzzles, which may contain emerging arcs of a story as perceived by the player.
  While we found that even a simple rule set can create stories that are interesting to reason about, we expect that this type of system is flexible enough to create considerably more engaging stories if enough time is invested in authoring more complex rule sets.
  
  You can find the full paper [here.](http://ieee-cog.org/papers/paper_45.pdf)
