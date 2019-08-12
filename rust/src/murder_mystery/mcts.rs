const EPSILON: f32 = 30.0;

use rand::prelude::*;
use crate::murder_mystery::eval::*;
use crate::murder_mystery::predicate::{PredicateSignature};
use crate::murder_mystery::simulation::*;

struct Node<T: PredicateSignature> {
    children: Vec<Node<T>>,
    actor: usize,
    rule_instance: Option<RuleInstance<T>>,
    visits: usize,
    accum_score: f32,
    untried_rules: Vec<RuleInstance<T>>,
    state: PredicateState<T>,
}

impl<T: PredicateSignature> Node<T> {
    fn new(rule_instance: Option<RuleInstance<T>>, actor: usize, evaluator: &Evaluator<T>, state: PredicateState<T>) -> Node<T> {
        Node {
            children: vec![],
            actor: actor,
            rule_instance: rule_instance,
            untried_rules: evaluator.step(&state.predicates).into_iter().filter(|action| action.get_main_actors() == actor).collect(),
            visits: 0,
            accum_score: 0.0,
            state: state,
        }
    }

    fn uct_select_child(&mut self) -> Option<&mut Node<T>> {
        if self.children.is_empty() {
            return None;
        }

        let log_visits = (self.visits as f32).log(2.0);
        let mut current_best = 0;
        let mut current_max = self.children[0].score(log_visits);
        for (i, child) in self.children.iter().skip(1).enumerate() {
            let my_score = child.score(log_visits);
            if my_score > current_max {
                current_best = i;
                current_max = my_score;
            }
        }
        Some(&mut self.children[current_best])
    }

    fn score(&self, log_visits: f32) -> f32 {
        let visits = self.visits as f32;
        self.accum_score / visits + EPSILON * (2.0 * log_visits / visits).sqrt()
    }

    fn uct_select_next(&mut self, rollout_steps: usize, rng: &mut impl Rng, registry: &mut <T as PredicateSignature>::Registry, evaluator: &Evaluator<T>) -> f32 {
        if self.has_untried_rules() {
            match self.create_random_child_state(rng, registry, evaluator) {
                None => return 0.0,
                Some(n) => {
                    let score = n.do_rollout(rollout_steps, registry, rng, evaluator);
                    self.update(score);
                    return score
                }
            }
        }
        if self.children.is_empty() {
            return 0.0;
        }

        let score = match self.uct_select_child() {
            Some(c) => c.uct_select_next(rollout_steps, rng, registry, evaluator),
            None => 0.0,
        };
        self.update(score);
        score
    }

    fn has_untried_rules(&self) -> bool {
        !self.untried_rules.is_empty()
    }

    fn create_random_child_state(&mut self, mut rng: &mut impl Rng, registry: &mut <T as PredicateSignature>::Registry, evaluator: &Evaluator<T>) -> Option<&Node<T>> {
        if self.untried_rules.is_empty() {
            return None
        }

        let index = rng.gen_range(0, self.untried_rules.len());
        let rule_instance = self.untried_rules[index].clone();
        let mut state = self.state.clone();
        state.take_action(evaluator, self.actor, &rule_instance, registry, &mut rng);
        self.untried_rules.remove(index);

        let n = Node::new(Some(rule_instance), self.actor, &evaluator, state);
        self.children.push(n);
        self.children.last()
    }

    fn do_rollout(&self, rollout_steps: usize, registry: &mut <T as PredicateSignature>::Registry, mut rng: &mut impl Rng, evaluator: &Evaluator<T>) -> f32 {
        let mut state = self.state.clone();
        for _ in 0..rollout_steps {
            let rule_instances = state.get_actions_for_actor(self.actor, evaluator);
            if rule_instances.is_empty() {
                break
            }
            state.take_action(evaluator, self.actor, &rule_instances.choose(rng).unwrap(), registry, &mut rng);
        }
        state.get_score_for_actor(self.actor)
    }

    fn update(&mut self, score: f32) {
        self.accum_score += score;
        self.visits += 1;
    }
}

pub fn uct_find_best_rule<T: PredicateSignature>(simulation: &mut Simulation<T>, actor: usize, max_iterations: usize, rollout_steps: usize, registry: &mut <T as PredicateSignature>::Registry) -> Option<RuleInstance<T>>
{
    let mut root = Node::new(None, actor, &simulation.evaluator, simulation.get_state_copy());
    let evaluator = &simulation.evaluator;
    let rng = &mut simulation.rng;

    for _ in 0..max_iterations {
        root.uct_select_next(rollout_steps, rng, registry, evaluator);
    }

    let mut max_child = None;
    let mut max_visits = 0;
    for child in root.children {
        if child.visits > max_visits {
            max_visits = child.visits;
            max_child = child.rule_instance;
        }
    }
    max_child
}
