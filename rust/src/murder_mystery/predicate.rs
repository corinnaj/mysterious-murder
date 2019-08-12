use serde_derive::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::hash::Hash;
use std::fmt::Debug;

pub use crate::murder_mystery::predicate_small::*;

pub trait PredicateSignature : Sized + PartialEq + Clone + Default + Eq + Hash + Debug {
    type Registry: PredicateSignatureRegistry;
    fn new(name: &String, actors: &Vec<usize>, registry: &mut Self::Registry) -> Self;

    fn get_name_string(&self, registry: &Self::Registry) -> String;
    fn get_actors_vector(&self) -> Vec<usize>;
    fn to_small(&self, registry: &mut PredicateSignatureSmallRegistry) -> PredicateSignatureSmall;
    fn get_json(&self, registry: &Self::Registry) -> Value;
}

pub trait PredicateSignatureRegistry {
    fn store(&mut self, name: &String) -> usize;
    // FIXME: actually the wrong concrete type, need circular type reference
    fn get_name_string(&self, signature: &PredicateSignatureSmall) -> String;
}

pub struct NoopRegistry {
}
impl PredicateSignatureRegistry for NoopRegistry {
    fn store(&mut self, _name: &String) -> usize {
        0
    }

    fn get_name_string(&self, _signature: &PredicateSignatureSmall) -> String {
        "".to_owned()
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Eq, PartialEq, Default, Hash)]
pub struct PredicateInstanceLarge {
    name: String,
    actors: Vec<usize>,
}
impl PredicateSignature for PredicateInstanceLarge {
    type Registry = NoopRegistry;

    fn new(name: &String, actors: &Vec<usize>, _: &mut Self::Registry) -> PredicateInstanceLarge {
        PredicateInstanceLarge {
            name: name.to_owned(),
            actors: actors.to_owned(),
        }
    }

    fn get_name_string(&self, _registry: &Self::Registry) -> String {
        self.name.to_owned()
    }

    fn get_actors_vector(&self) -> Vec<usize> {
        self.actors.to_owned()
    }

    fn to_small(&self, registry: &mut PredicateSignatureSmallRegistry) -> PredicateSignatureSmall {
        PredicateSignatureSmall::new(&self.name, &self.actors, registry)
    }

    fn get_json(&self, registry: &Self::Registry) -> Value {
        json!({
            "name": self.get_name_string(registry),
            "actors": self.get_actors_vector(),
        })
    }
}
