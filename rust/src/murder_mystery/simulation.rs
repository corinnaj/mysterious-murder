use rand_xorshift::XorShiftRng;
use rand::prelude::*;

use crate::murder_mystery::eval::*;
use crate::murder_mystery::predicate::PredicateSignature;
use crate::murder_mystery::mcts;

use serde_json::{json, Value};

#[derive(Clone)]
pub struct PredicateState<T: PredicateSignature> {
    pub predicates: Vec<T>,
    pub scores: Vec<ActorState>,
}
impl<T: PredicateSignature> PredicateState<T> {
    pub fn new(predicates: Vec<T>, n_actors: usize) -> PredicateState<T> {
        PredicateState {
            predicates: predicates,
            scores: (0..n_actors).map(|_| ActorState::new()).collect(),
        }
    }

    pub fn take_action(&mut self,
                       evaluator: &Evaluator<T>,
                       actor: usize,
                       rule_instance: &RuleInstance<T>,
                       registry: &mut <T as PredicateSignature>::Registry,
                       rng: &mut impl Rng) {
        self.take_action_reporting(evaluator, actor, rule_instance, registry, rng, |_| {});
    }

    pub fn take_action_reporting<F: FnMut(&T)>(&mut self,
                                               evaluator: &Evaluator<T>,
                                               actor: usize,
                                               rule_instance: &RuleInstance<T>,
                                               registry: &mut <T as PredicateSignature>::Registry,
                                               rng: &mut impl Rng,
                                               callback: F) {
        let outcome = evaluator.apply_reporting(rule_instance, &mut self.predicates, rng, registry, callback);
        outcome.apply_score(&mut self.scores[actor]);
    }

    pub fn get_actions_for_actor(&self, actor: usize, evaluator: &Evaluator<T>) -> Vec<RuleInstance<T>> {
        evaluator.step(&self.predicates).into_iter().filter(|action| action.get_main_actors() == actor).collect()
    }

    pub fn get_score_for_actor(&self, index: usize) -> f32 {
        let actor = &self.scores[index];
        actor.sanity_score + actor.social_score + actor.fulfilment_score
    }

    pub fn get_json(&self, registry: &T::Registry) -> Value {
        let v: Vec<Value> = self.predicates.iter().map(|p| json!({
            "name": p.get_name_string(registry),
            "actors": p.get_actors_vector(),
        })).collect();
        Value::from(v)
    }
}

#[derive(Clone)]
pub struct Simulation<T: PredicateSignature> {
    state: PredicateState<T>,
    pub evaluator: Evaluator<T>,
    pub rng: XorShiftRng,
}

impl<T: PredicateSignature> Simulation<T> {
    pub fn new(evaluator: Evaluator<T>, predicates: Vec<T>, seed: usize) -> Simulation<T> {
        let simulation = Simulation {
            state: PredicateState::new(predicates, evaluator.get_actors().len()),
            evaluator: evaluator,
            rng: XorShiftRng::seed_from_u64(seed as u64),
        };
        simulation
    }

    pub fn get_state_json(&self, registry: &T::Registry) -> Value {
        self.state.get_json(registry)
    }

    pub fn get_state_copy(&self) -> PredicateState<T> {
        self.state.clone()
    }

    pub fn get_evaluator(&self) -> &Evaluator<T> {
        &self.evaluator
    }

    pub fn take_action(&mut self, actor: usize, rule_instance: &RuleInstance<T>, registry: &mut <T as PredicateSignature>::Registry) -> Vec<T> {
        let mut outputs: Vec<T> = vec![];
        self.state.take_action_reporting(&self.evaluator, actor, rule_instance, registry, &mut self.rng, |p| {
            outputs.push(p.clone());
        });
        outputs
    }

    pub fn get_score_for_actor(&self, actor: usize) -> f32 {
        self.state.get_score_for_actor(actor)
    }

    pub fn get_actions_for_actor(&self, actor: usize) -> Vec<RuleInstance<T>> {
        self.state.get_actions_for_actor(actor, &self.evaluator)
    }

    pub fn get_rng(&mut self) -> &mut XorShiftRng
    {
        &mut self.rng
    }

    pub fn step_mcts_actor(&mut self, actor: usize, registry: &mut <T as PredicateSignature>::Registry) -> String {
        match mcts::uct_find_best_rule(self, actor, 1000, 30, registry) {
            Some(rule) => {
                self.take_action(0, &rule, registry);
                rule.get_name()
            },
            None => "Nope".to_string(),
        }
    }
}
