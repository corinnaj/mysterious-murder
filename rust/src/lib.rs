extern crate serde_json;
extern crate serde_derive;
extern crate wasm_bindgen;

mod utils;
mod murder_mystery;

use crate::murder_mystery::eval::*;
use crate::murder_mystery::simulation::Simulation;
use crate::murder_mystery::predicate::NoopRegistry;
use crate::murder_mystery::mcts;
use rand::seq::SliceRandom;
use serde_json::{json, Value};

use wasm_bindgen::prelude::*;

// #[cfg(feature = "wee_alloc")]
// #[global_allocator]
// static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
    fn postMessage(object: &JsValue);
}

/*#[wasm_bindgen]
pub fn generate_characters(count: usize, seed: usize) -> Vec<Actor<PredicateSignatureSmall>> {
    let mut registry = PredicateSignatureSmallRegistry::new();
    Actor::generate_characters(count, seed, &mut registry)
}*/

#[wasm_bindgen]
pub fn run_simulation(data: &str, seed: usize) -> String {
    utils::set_panic_hook();

    let mut registry = PredicateSignatureSmallRegistry::new();
    let mut _registry = NoopRegistry{};
    let mut _eval: Evaluator<PredicateInstanceLarge> = serde_json::from_str(data).expect("JSON was not well-formatted");

    const N_ACTORS: usize = 4;
    let characters = Actor::generate_characters(N_ACTORS, 20, &mut _registry);
    // let mut state = characters.iter().flat_map(|c| c.get_predicates().iter().map(|c| c.to_small(&mut registry)).collect()).collect();
    let init_state: Vec<PredicateInstanceLarge> = characters.iter().flat_map(|c| c.get_predicates()).collect();
    let state: Vec<PredicateSignatureSmall> = init_state.iter().map(|p| p.to_small(&mut registry)).collect();
    _eval.set_actors(characters);
    _eval.prepare_after_parse(&mut _registry);

    let mut simulation = Simulation::new(_eval.to_small_signatures(&mut registry), state, seed);

    let mut turn = 0;
    let mut i = 0;
    loop {
        match mcts::uct_find_best_rule(&mut simulation, turn, 10, 30, &mut registry) {
            Some(action) => {
                let outputs = simulation.take_action(0, &action, &mut registry);

                postMessage(&JsValue::from_str(&json!({
                    "type": "action",
                    "name": action.get_name(),
                    "actors": action.get_actors(),
                    "inputs": action.get_predicate_instances().iter().map(|p| p.get_json(&registry)).collect::<Vec<Value>>(),
                    "outputs": outputs.iter().map(|p| p.get_json(&registry)).collect::<Vec<Value>>(),
                }).to_string()));

                if action.get_name().contains("murder") {
                    postMessage(&JsValue::from_str(&json!({
                        "type": "state",
                        "state": simulation.get_state_json(&registry),
                    }).to_string()));
                    break;
                }
            },
            None => {},
        }
        i += 1;
        turn = (turn + 1) % N_ACTORS;
    }
    serde_json::to_string("").unwrap()
}
