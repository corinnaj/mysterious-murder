use rand_xorshift::XorShiftRng;
use rand::prelude::{Rng, SeedableRng};
use rand::seq::SliceRandom;

use crate::murder_mystery::predicate::PredicateSignature;
use crate::murder_mystery::eval::Actor;

impl<T: PredicateSignature> Actor<T> {
    fn random_trait(&mut self, typ: &str, opposite_type: &str, rng: &mut impl Rng, registry: &mut <T as PredicateSignature>::Registry) {
        let r = rng.gen_range(0, 3);
        for _ in 0..r {
            self.add_trait(typ, registry);
        }
        for _ in 0..(2 - r) {
            self.add_trait(opposite_type, registry);
        }
    }

    fn random_relationship_trait(&mut self, typ: &str, opposite_type: &str, towards: &Actor<T>, rng: &mut impl Rng, registry: &mut <T as PredicateSignature>::Registry) {
        let r = rng.gen_range(0, 3);
        for _ in 0..r {
            self.add_trait_towards(typ, towards, registry);
        }
        for _ in 0..(2 - r) {
            self.add_trait_towards(opposite_type, towards, registry);
        }
    }

    fn add_trait(&mut self, typ: &str, registry: &mut <T as PredicateSignature>::Registry) {
        self.add_predicate(T::new(&typ.to_owned(), &vec![self.index], registry))
    }

    fn add_trait_towards(&mut self, typ: &str, towards: &Actor<T>, registry: &mut <T as PredicateSignature>::Registry) {
        self.add_predicate(T::new(&typ.to_owned(), &vec![self.index, towards.index], registry))
    }

    fn add_symmetric(&mut self, typ: &str, other: &mut Actor<T>, registry: &mut <T as PredicateSignature>::Registry) {
        self.add_predicate(T::new(&typ.to_owned(), &vec![self.index, other.index], registry));
        other.add_predicate(T::new(&typ.to_owned(), &vec![other.index, self.index], registry));
    }

    pub fn generate_characters(count: usize, seed: usize, registry: &mut <T as PredicateSignature>::Registry) -> Vec<Actor<T>> {
        let mut rng = XorShiftRng::seed_from_u64(seed as u64);

        let mut characters: Vec<Actor<T>> = (0..count).map(|i| {
            let mut actor = Actor::new("hi", i);
            actor.add_trait("alive", registry);
            actor.add_trait(&["good", "neutral", "evil"].choose(&mut rng).unwrap(), registry);
            actor.random_trait("cautious", "curious", &mut rng, registry);
            actor.random_trait("disciplined", "spontaneous", &mut rng, registry);
            actor.random_trait("extrovert", "introvert", &mut rng, registry);
            actor.random_trait("trusting", "suspicious", &mut rng, registry);
            actor.random_trait("confident", "insecure", &mut rng, registry);
            actor.random_trait("sadness", "joy", &mut rng, registry);
            if rng.gen::<f32>() < 0.2 {
                actor.add_trait("has_money", registry);
            }
            actor
        }).collect();

        for i in 0..count {
            let (a, rest) = characters[i..].split_first_mut().unwrap();
            for j in 0..rest.len() {
                let b = &mut rest[j];

                if rng.gen::<f32>() < 0.2 {
                    a.add_symmetric("related", b, registry);
                } else {
                    a.add_symmetric("not_related", b, registry);
                    if rng.gen::<f32>() < 0.25 {
                        a.add_symmetric("married", b, registry);
                    } else if rng.gen::<f32>() < 0.4 {
                        a.add_symmetric("lovers", b, registry);
                    }
                }
                a.random_relationship_trait("trust", "disgust", b, &mut rng, registry);
                a.random_relationship_trait("anger", "fear", b, &mut rng, registry);
                b.random_relationship_trait("trust", "disgust", a, &mut rng, registry);
                b.random_relationship_trait("anger", "fear", a, &mut rng, registry);
            }
        }

        characters
    }
}
