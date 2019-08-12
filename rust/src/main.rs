extern crate serde_json;
extern crate serde_derive;

use std::fs::File;
use std::io::Read;
use rand::seq::SliceRandom;

mod murder_mystery;

use crate::murder_mystery::predicate::{PredicateSignatureSmallRegistry, NoopRegistry};
use crate::murder_mystery::eval::*;
use crate::murder_mystery::mcts;
use crate::murder_mystery::simulation::Simulation;

fn main() {
    const N_ACTORS: usize = 4;

    let mut file = File::open("murder_mystery.json").unwrap();
    let mut data = String::new();
    file.read_to_string(&mut data).unwrap();

    let mut _registry = NoopRegistry{};
    let mut registry = PredicateSignatureSmallRegistry::new();
    let mut _eval: Evaluator<PredicateInstanceLarge> = serde_json::from_str(&data).expect("JSON was not well-formatted");
    let characters = Actor::generate_characters(N_ACTORS, 20, &mut _registry);
    let init_state: Vec<PredicateInstanceLarge> = characters.iter().flat_map(|c| c.get_predicates()).collect();
    let state: Vec<PredicateSignatureSmall> = init_state.iter().map(|p| p.to_small(&mut registry)).collect();
    _eval.set_actors(characters);
    _eval.prepare_after_parse(&mut _registry);

    let args: Vec<String> = std::env::args().collect();
    let seed = match args.get(1) {
        Some(s) => s.parse::<usize>().unwrap(),
        None => 20
    };
    let mut simulation = Simulation::new(_eval.to_small_signatures(&mut registry), state, seed);

    let mut turn = 0;
    loop {
        let actions = simulation.get_actions_for_actor(turn);

        if true {
            match mcts::uct_find_best_rule(&mut simulation, turn, 10, 30, &mut registry) {
                Some(action) => {
                    println!("{:?}", action.get_name());
                    if action.get_name().contains("murder") {
                        break;
                    }

                    simulation.take_action(0, &action, &mut registry);
                },
                None => println!("- no action -"),
            }
        } else {
            if let Some(action) = actions.choose(simulation.get_rng()) {
                println!("{:?}", action.get_name());
                simulation.take_action(0, action, &mut registry);
            } else {
                println!("none");
                break;
            }
        }
        turn = (turn + 1) % N_ACTORS;
    }
}

