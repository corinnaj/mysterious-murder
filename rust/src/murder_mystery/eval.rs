use serde_derive::{Deserialize, Serialize};

#[cfg(test)]
use rand_xorshift::XorShiftRng;

use std::cell::RefCell;
use std::rc::Rc;
use rand::prelude::*;
use permutohedron::LexicalPermutation;
pub use crate::murder_mystery::predicate::{PredicateSignature, PredicateSignatureSmall, PredicateSignatureRegistry, PredicateSignatureSmallRegistry, PredicateInstanceLarge};

trait Permutations : Iterator<Item = usize> + Sized
{
    fn permutations(self, size: usize) -> Vec<Vec<usize>>;
}
impl<I> Permutations for I
    where I: Iterator<Item = usize>
{
    fn permutations(self, size: usize) -> Vec<Vec<usize>>
        where I: Iterator
    {
        let mut data: Vec<usize> = self.collect();
        let mut permutations = Vec::new();

        loop {
            permutations.push(data[0..size].to_owned());
            if !data.next_permutation() {
                break;
            }
        }
        permutations.sort_unstable();
        permutations.dedup();
        permutations
    }
}

#[test]
fn test_2_1() {
    let res: Vec<Vec<usize>> = (0..3).permutations(1);
    assert_eq!(res, vec![vec![0], vec![1], vec![2]]);
}

#[test]
fn test_2_3() {
    let res: Vec<Vec<usize>> = (0..3).permutations(3);
    assert_eq!(res, vec![vec![0, 1, 2], vec![0, 2, 1], vec![1, 0, 2], vec![1, 2, 0], vec![2, 0, 1], vec![2, 1, 0]]);
}

#[test]
fn test_2_2() {
    let res: Vec<Vec<usize>> = (0..3).permutations(2);
    assert_eq!(res, vec![vec![0, 1], vec![0, 2], vec![1, 0], vec![1, 2], vec![2, 0], vec![2, 1]]);
}


struct PredicateStateAccess<'a, T: PredicateSignature> {
    state: &'a Vec<T>,
    // taken: HashMap<&'a T, std::slice::Iter<'a, T>>,
    taken: Vec<(&'a T, std::slice::Iter<'a, T>)>,
}
impl<'a, T: PredicateSignature> PredicateStateAccess<'a, T> {
    fn new(state: &'a Vec<T>) -> PredicateStateAccess<'a, T> {
        PredicateStateAccess {
            state: state,
            // taken: HashMap::new(),
            taken: vec![],
        }
    }

    fn begin(&mut self) {
        self.taken.clear()
    }

    fn get(&mut self, signature: &'a T) -> Option<&'a T> {
        /*let iter = match self.taken.entry(signature) {
            std::collections::hash_map::Entry::Occupied(o) => o.into_mut(),
            std::collections::hash_map::Entry::Vacant(v) => v.insert(self.state.iter()),
        };*/
        let iter = match self.taken.iter_mut().find(|v| v.0 == signature) {
            Some(it) => &mut it.1,
            None => {
                self.taken.push((signature, self.state.iter()));
                &mut self.taken.last_mut().unwrap().1
            }
        };

        iter.find(|p| *p == signature)
    }
}

#[derive(Clone, Debug)]
pub struct RuleInstance<T: PredicateSignature> {
    rule: Rc<Rule<T>>,
    actors: Vec<usize>,
    predicate_instances: Vec<T>,
}
impl<T: PredicateSignature> RuleInstance<T> {
    fn pick_outcome<R: Rng>(&self, rng: &mut R) -> &Outcome<T> {
        if self.rule.rhs.len() == 1 {
            return self.rule.rhs.first().unwrap();
        }

        let pick: f32 = rng.gen();
        let mut progress = 0.0;
        for outcome in &self.rule.rhs {
            progress += outcome.probability;
            if progress < pick {
                return outcome;
            }
        }
        self.rule.rhs.last().unwrap()
    }

    pub fn get_predicate_instances(&self) -> &Vec<T> {
        &self.predicate_instances
    }

    pub fn get_actors(&self) -> &Vec<usize> {
        &self.actors
    }

    pub fn get_main_actors(&self) -> usize {
        self.actors[0]
    }

    pub fn get_name(&self) -> String {
        self.rule.name.to_owned()
    }
}

fn return_false() -> bool { false }

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Predicate<T: PredicateSignature> {
    signature: T,
    #[serde(default = "return_false")]
    keep: bool,
    #[serde(default = "return_false")]
    permanent: bool,
}
impl<T: PredicateSignature> Predicate<T> {
    #[cfg(test)]
    fn new(name: &str, actors: Vec<usize>, registry: &mut <T as PredicateSignature>::Registry) -> Predicate<T> {
        Predicate {
            signature: T::new(&name.to_owned(), &actors, registry),
            keep: false,
            permanent: false,
        }
    }

    fn n_actors(&self) -> usize {
        self.signature.get_actors_vector().iter().fold(0, |acc, v| core::cmp::max(acc, *v)) + 1
    }

    fn to_small_signature(&self, registry: &mut PredicateSignatureSmallRegistry) -> Predicate<PredicateSignatureSmall> {
        Predicate {
            signature: self.signature.to_small(registry),
            keep: self.keep,
            permanent: self.permanent,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Outcome<T: PredicateSignature> {
    probability: f32,
    predicates: Vec<Predicate<T>>,
    template: String,
    reset_rewards: bool,
    admit_probability: f32,
    witness_probability: f32,
    social: f32,
    sanity: f32,
    fulfilment: f32,
}
impl<T: PredicateSignature> Outcome<T> {
    #[cfg(test)]
    fn new(predicates: Vec<Predicate<T>>, probability: f32, template: &str) -> Outcome<T> {
        Outcome {
            probability: probability,
            predicates: predicates,
            template: template.to_owned(),
            admit_probability: 0f32,
            witness_probability: 0f32,
            social: 0f32,
            sanity: 0f32,
            fulfilment: 0f32,
            reset_rewards: false,
        }
    }

    pub fn apply_score(&self, actor: &mut ActorState) {
        if self.reset_rewards {
            actor.sanity_score = 0f32;
            actor.fulfilment_score = 0f32;
            actor.sanity_score = 0f32;
        }
        actor.sanity_score += self.sanity;
        actor.fulfilment_score += self.fulfilment;
        actor.sanity_score += self.sanity;
    }

    fn to_small_signatures(&self, registry: &mut PredicateSignatureSmallRegistry) -> Outcome<PredicateSignatureSmall> {
        Outcome {
            probability: self.probability,
            predicates: self.predicates.iter().map(|p| p.to_small_signature(registry)).collect(),
            template: self.template.to_owned(),
            witness_probability: self.witness_probability,
            admit_probability: self.admit_probability,
            fulfilment: self.fulfilment,
            social: self.social,
            sanity: self.sanity,
            reset_rewards: self.reset_rewards,
        }
    }

    fn n_actors(&self) -> usize {
        self.predicates.iter().fold(0, |acc, v| core::cmp::max(acc, v.n_actors()))
    }
}

#[derive(Debug, Clone)]
struct PredicatePermutation<T: PredicateSignature> {
    permutation: Vec<usize>,
    predicates: Vec<T>,
}
impl<PredicateInstanceLarge: PredicateSignature> PredicatePermutation<PredicateInstanceLarge> {
    fn to_small_signatures(&self, registry: &mut PredicateSignatureSmallRegistry) -> PredicatePermutation<PredicateSignatureSmall>{
        PredicatePermutation {
            permutation: self.permutation.to_owned(),
            predicates: self.predicates.iter().map(|p| p.to_small(registry)).collect(),
        }
    }
}

#[derive(Serialize, Deserialize)]
struct Rule<T: PredicateSignature> {
    name: String,
    lhs: Vec<Predicate<T>>,
    rhs: Vec<Outcome<T>>,
    #[serde(skip)]
    #[serde(default)]
    permutations: RefCell<Vec<PredicatePermutation<T>>>,
}

impl<T: PredicateSignature> std::fmt::Debug for Rule<T> {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::result::Result<(), std::fmt::Error> {
        std::fmt::Debug::fmt(&self.name, f)
    }
}

impl<T: PredicateSignature> Rule<T> {
    #[cfg(test)]
    fn new(name: &str, lhs: Vec<Predicate<T>>, rhs: Vec<Outcome<T>>, n_actors: usize, registry: &mut <T as PredicateSignature>::Registry) -> Rule<T> {
        let rule = Rule {
            name: name.to_owned(),
            lhs: lhs,
            rhs: rhs,
            permutations: RefCell::new(Vec::new()),
        };
        rule.precompute_permutations(n_actors, registry);
        rule
    }

    fn to_small_signatures(&self, registry: &mut PredicateSignatureSmallRegistry) -> Rule<PredicateSignatureSmall> {
        Rule {
            name: self.name.to_owned(),
            lhs: self.lhs.iter().map(|l| l.to_small_signature(registry)).collect(),
            rhs: self.rhs.iter().map(|l| l.to_small_signatures(registry)).collect(),
            permutations: RefCell::new(self.permutations.borrow().iter().map(|p| p.to_small_signatures(registry)).collect()),
        }
    }

    fn precompute_permutations(&self, n_actors: usize, registry: &mut <T as PredicateSignature>::Registry) {
        // self.permutations = RefCell::new(vec![]);
        let mut permutations = self.permutations.borrow_mut();
        for permutation in (0..(n_actors + 1)).permutations(self.n_actors()) {
            permutations.push(PredicatePermutation{
                predicates: self.lhs
                    .iter()
                    .map(|predicate| T::new(
                        &predicate.signature.get_name_string(registry),
                        &predicate.signature.get_actors_vector().iter().map(|actor| permutation[*actor]).collect(),
                        registry,
                    ))
                    .collect(),
                permutation: permutation,
            });
        }
    }

    fn get_options_into(&self, state: &Vec<T>, rc: &Rc<Rule<T>>, dest: &mut Vec<RuleInstance<T>>) {
        let permutations = self.permutations.borrow();
        for permutation in permutations.iter() {
            let mut state_access = PredicateStateAccess::new(state);
            state_access.begin();
            let mut predicate_instances: Vec<T> = Vec::with_capacity(self.lhs.len());
            for permutation in permutation.predicates.iter() {
                match (&mut state_access).get(&permutation) {
                    Some(predicate_instance) => predicate_instances.push((*predicate_instance).clone()),
                    None => break,
                }
            }

            if predicate_instances.len() == self.lhs.len() {
                dest.push(self.instance(permutation.permutation.clone(), predicate_instances, rc));
            }
        }
    }

    fn get_options(&self, state: &Vec<T>, rc: &Rc<Rule<T>>) -> Vec<RuleInstance<T>> {
        let mut options = Vec::new();
        self.get_options_into(state, rc, &mut options);
        options
    }

    fn instance(&self, permutation: Vec<usize>, predicate_instances: Vec<T>, rc: &Rc<Rule<T>>) -> RuleInstance<T> {
        RuleInstance {
            rule: Rc::clone(rc),
            actors: permutation,
            predicate_instances: predicate_instances,
        }
    }

    fn n_actors(&self) -> usize {
        core::cmp::max(
            self.lhs.iter().fold(0, |acc, v| core::cmp::max(acc, v.n_actors())),
            self.rhs.iter().fold(0, |acc, v| core::cmp::max(acc, v.n_actors()))
        )
    }
}

#[test]
fn test_rule_n_actors() {
    let mut r = PredicateSignatureSmallRegistry::new();
    let rule: Rule<PredicateSignatureSmall> = Rule {
        name: "".to_owned(),
        lhs: vec![Predicate::new("hi", vec![0, 1], &mut r), Predicate::new("abc", vec![0, 2], &mut r)],
        rhs: vec![],
        permutations: RefCell::new(vec![]),
    };
    assert_eq!(rule.n_actors(), 3);
}
#[test]
fn test_get_option_with_one_possible() {
    let mut r = PredicateSignatureSmallRegistry::new();
    let rule = Rc::new(Rule::new("rule1", vec![Predicate::new("hi", vec![0, 1], &mut r), Predicate::new("abc", vec![0, 2], &mut r)], vec![], 3, &mut r));
    let state = vec![PredicateSignatureSmall::new(&"hi".to_owned(), &vec![1, 0], &mut r), PredicateSignatureSmall::new(&"abc".to_owned(), &vec![1, 2], &mut r)];

    assert_eq!(rule.get_options(&state, &rule).first().unwrap().rule.name, "rule1");
}
#[test]
fn test_more_actors_than_needed() {
    let mut registry = PredicateSignatureSmallRegistry::new();
    let rule = Rc::new(Rule::new("rule1", vec![Predicate::new("hi", vec![0, 1], &mut registry)], vec![], 7, &mut registry));
    let state = vec![PredicateSignatureSmall::new(&"hi".to_owned(), &vec![0, 1], &mut registry)];
    assert_eq!(rule.get_options(&state, &rule).len(), 1);
}
#[test]
fn test_get_option_with_two_required_resources() {
    let mut registry = PredicateSignatureSmallRegistry::new();
    let rule = Rc::new(Rule::new("rule1",
                                 vec![Predicate::new("hi", vec![0, 1], &mut registry), Predicate::new("hi", vec![0, 1], &mut registry)],
                                 vec![],
                                 3,
                                 &mut registry));
    let state = vec![PredicateSignatureSmall::new(&"hi".to_owned(), &vec![1, 0], &mut registry)];
    assert!(rule.get_options(&state, &rule).is_empty());
}

#[derive(Clone)]
pub struct ActorState {
    pub social_score: f32,
    pub fulfilment_score: f32,
    pub sanity_score: f32,
}
impl ActorState {
    pub fn new() -> ActorState {
        ActorState {
            social_score: 0f32,
            fulfilment_score: 0f32,
            sanity_score: 0f32,
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Actor<T: PredicateSignature> {
    name: String,
    #[serde(skip)]
    pub index: usize,
    #[serde(skip)]
    predicates: Vec<T>,
}
impl<T: PredicateSignature> PartialEq for Actor<T> {
    fn eq(&self, other: &Actor<T>) -> bool {
        self.name == other.name
    }
}
impl<T: PredicateSignature> Eq for Actor<T> {}
impl<T: PredicateSignature> Actor<T> {
    pub fn new(name: &str, index: usize) -> Actor<T> {
        Actor {
            name: name.to_owned(),
            index: index,
            predicates: vec![],
        }
    }

    pub fn add_predicate(&mut self, instance: T) {
        self.predicates.push(instance);
    }

    pub fn get_predicates(&self) -> Vec<T> {
        self.predicates.to_owned()
    }

    pub fn to_small_signatures(&self, registry: &mut PredicateSignatureSmallRegistry) -> Actor<PredicateSignatureSmall> {
        Actor {
            name: self.name.to_owned(),
            index: self.index,
            predicates: self.predicates.iter().map(|p| p.to_small(registry)).collect(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Evaluator<T: PredicateSignature> {
    rules: Vec<Rc<Rule<T>>>,
    actors: Vec<Actor<T>>,
}

impl <PredicateInstanceLarge: PredicateSignature> Evaluator<PredicateInstanceLarge> {
    pub fn to_small_signatures(&self, registry: &mut PredicateSignatureSmallRegistry) -> Evaluator<PredicateSignatureSmall> {
        Evaluator {
            rules: self.rules.iter().map(|r| Rc::new(r.to_small_signatures(registry))).collect(),
            actors: self.actors.iter().map(|a| a.to_small_signatures(registry)).collect(),
        }
    }
}

impl<T: PredicateSignature> Evaluator<T> {
    pub fn get_actors(&self) -> &Vec<Actor<T>> {
        &self.actors
    }

    pub fn set_actors(&mut self, actors: Vec<Actor<T>>) {
        self.actors = actors;
    }

    pub fn prepare_after_parse(&mut self, registry: &mut <T as PredicateSignature>::Registry) {
        for rule in &mut self.rules {
            rule.precompute_permutations(self.actors.len(), registry);
        }
        for (index, actor) in self.actors.iter_mut().enumerate() {
            actor.index = index;
        }
    }

    pub fn step(&self, state: &Vec<T>) -> Vec<RuleInstance<T>> {
        // slightly slower then below:
        // self.rules.into_iter().flat_map(|rule| rule.get_options(state, rule)).collect()

        let mut options = vec![];
        options.reserve(40);
        for rule in &self.rules {
            rule.get_options_into(state, rule, &mut options);
        }
        options
    }

    pub fn apply_reporting<'a, F: FnMut(&T) -> ()>(&self,
                                                   option: &'a RuleInstance<T>,
                                                   state: &mut Vec<T>,
                                                   rng: &mut impl Rng,
                                                   registry: &mut <T as PredicateSignature>::Registry,
                                                   mut callback: F) -> &'a Outcome<T> {
        for (instance, predicate) in option.predicate_instances.iter().zip(option.rule.lhs.iter()) {
            if !predicate.keep && !predicate.permanent {
                state.remove(state.iter().position(|p| *p == *instance).unwrap());
            }
        }
        let outcome = option.pick_outcome(rng);
        for predicate in &outcome.predicates {
            let p = T::new(
                &predicate.signature.get_name_string(registry),
                &predicate.signature.get_actors_vector().iter().map(|i| option.actors[*i]).collect::<Vec<usize>>(),
                registry,
            );
            callback(&p);
            state.push(p);
        }
        outcome
    }

    pub fn apply<'a>(&self, option: &'a RuleInstance<T>, state: &mut Vec<T>, rng: &mut impl Rng, registry: &mut <T as PredicateSignature>::Registry) -> &'a Outcome<T> {
        self.apply_reporting(option, state, rng, registry, |_| {})
    }
}
#[test]
fn test_apply_option() {
    let mut registry = PredicateSignatureSmallRegistry::new();
    let rule = Rc::new(Rule::new("rule1",
                         vec![Predicate::new("hi", vec![0, 1], &mut registry)],
                         vec![Outcome::new(vec![Predicate::new("bye", vec![0], &mut registry)], 1.0, "")],
                         3,
                         &mut registry));
    let mut state = vec![PredicateSignatureSmall::new(&"hi".to_owned(), &vec![0, 1], &mut registry)];
    let eval = Evaluator {
        rules: vec![rule],
        actors: vec![Actor::new("joe", 0), Actor::new("josie", 1)],
    };
    let options = eval.step(&mut state);
    assert_eq!(options.len(), 1);
    let mut rng = XorShiftRng::seed_from_u64(20);
    eval.apply(options.first().unwrap(), &mut state, &mut rng, &mut registry);
    assert_eq!(state.len(), 1);
    assert_eq!(state.first().unwrap().get_name_string(&registry), "bye");
}

