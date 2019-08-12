use crate::murder_mystery::predicate::*;
use serde_json::{Value, json};

pub struct PredicateSignatureSmallRegistry {
    names: Vec<String>,
}
impl PredicateSignatureSmallRegistry {
    pub fn new() -> PredicateSignatureSmallRegistry {
        PredicateSignatureSmallRegistry {
            names: vec![],
        }
    }
}
impl PredicateSignatureRegistry for PredicateSignatureSmallRegistry {
    fn get_name_string(&self, signature: &PredicateSignatureSmall) -> String {
        self.names[signature.get_name_index()].to_owned()
    }

    fn store(&mut self, name: &String) -> usize {
        if let Some(index) = self.names.iter().position(|s| *s == *name) {
            return index
        }

        self.names.push(name.to_owned());
        self.names.len() - 1
    }
}
impl Default for PredicateSignatureSmallRegistry {
    fn default() -> Self {
        PredicateSignatureSmallRegistry::new()
    }
}

#[derive(PartialEq, Eq, Default, Clone, Hash)]
pub struct PredicateSignatureSmall(u64);

impl PredicateSignature for PredicateSignatureSmall {
    type Registry = PredicateSignatureSmallRegistry;

    // layout:
    // hi
    // 2  : num actors 1-4
    // 30 : predicate name index
    // 8  : 4st actor index
    // 8  : 3nd actor index
    // 8  : 2rd actor index
    // 8  : 1th actor index
    // lo
    fn new(name: &String, actors: &Vec<usize>, registry: &mut Self::Registry) -> PredicateSignatureSmall {
        assert!(actors.len() <= 4);
        PredicateSignatureSmall(
            ((actors.len() - 1) as u64) << 62 |
            (registry.store(name) as u64) << 32 |
            (if actors.len() > 0 {(actors[0] as u64) <<  0} else {0u64}) |
            (if actors.len() > 1 {(actors[1] as u64) <<  8} else {0u64}) |
            (if actors.len() > 2 {(actors[2] as u64) << 16} else {0u64}) |
            (if actors.len() > 3 {(actors[3] as u64) << 24} else {0u64}))
    }

    fn get_name_string(&self, registry: &Self::Registry) -> String {
        registry.get_name_string(self)
    }

    fn get_json(&self, registry: &Self::Registry) -> Value {
        json!({
            "name": self.get_name_string(registry),
            "actors": self.get_actors_vector(),
        })
    }

    fn get_actors_vector(&self) -> Vec<usize> {
        [
            ((self.0 & (0xFF <<  0)) >>  0) as usize,
            ((self.0 & (0xFF <<  8)) >>  8) as usize,
            ((self.0 & (0xFF << 16)) >> 16) as usize,
            ((self.0 & (0xFF << 24)) >> 24) as usize,
        ][0..self.get_actors_len()].to_vec()
    }

    fn to_small(&self, _registry: &mut PredicateSignatureSmallRegistry) -> PredicateSignatureSmall {
        self.clone()
    }
}
impl PredicateSignatureSmall {
    fn get_field(&self, index: usize) -> usize {
        ((self.0 & (0xFF << (index * 8))) >> (index * 8)) as usize
    }

    fn get_actors_len(&self) -> usize {
        (((self.0 & 0xC000000000000000) >> 62) + 1) as usize
    }

    fn get_name_index(&self) -> usize {
        ((self.0 & 0x3FFFFFFF00000000) >> 32) as usize
    }
}
impl core::fmt::Debug for PredicateSignatureSmall {
    fn fmt(&self, f: &mut core::fmt::Formatter) -> core::fmt::Result {
        write!(f, "[{} -> {} {} {} {}({})]",
               self.get_name_index(),
               self.get_field(0),
               self.get_field(1),
               self.get_field(2),
               self.get_field(3),
               self.get_actors_len())
    }
}

#[test]
fn test_small_signature_actors_len() {
    let mut registry = PredicateSignatureSmallRegistry::new();
    let signature = PredicateSignatureSmall::new(&"hi".to_owned(), &vec![1, 2, 3], &mut registry);
    assert_eq!(signature.get_actors_len(), 3);
}

#[test]
fn test_small_signature_get_name_index() {
    let mut registry = PredicateSignatureSmallRegistry::new();
    let signature = PredicateSignatureSmall::new(&"hi".to_owned(), &vec![1, 2, 3], &mut registry);
    let signature2 = PredicateSignatureSmall::new(&"abc".to_owned(), &vec![1, 2, 3], &mut registry);
    let signature3 = PredicateSignatureSmall::new(&"abc".to_owned(), &vec![1, 2, 3], &mut registry);
    assert_eq!(signature.get_name_index(), 0);
    assert_eq!(signature2.get_name_index(), 1);
    assert_eq!(signature3.get_name_index(), 1);
}

#[test]
fn test_small_signature_get_field() {
    let mut registry = PredicateSignatureSmallRegistry::new();
    let signature = PredicateSignatureSmall::new(&"hi".to_owned(), &vec![1, 2, 3], &mut registry);
    assert_eq!(signature.get_field(0), 1);
    assert_eq!(signature.get_field(1), 2);
    assert_eq!(signature.get_field(2), 3);
    assert_eq!(signature.get_field(3), 0);
}

#[test]
fn test_small_signature_get_actors_vector() {
    let mut registry = PredicateSignatureSmallRegistry::new();
    let signature = PredicateSignatureSmall::new(&"hi".to_owned(), &vec![1, 2, 3], &mut registry);
    assert_eq!(signature.get_actors_vector(), vec![1, 2, 3]);
}

#[test]
fn test_create_small_signature() {
    let mut registry = PredicateSignatureSmallRegistry::new();

    let signature = PredicateSignatureSmall::new(&"hi".to_owned(), &vec![1, 2, 3], &mut registry);
    assert_eq!(signature.get_name_string(&registry), "hi");
    assert_eq!(signature.get_actors_vector(), vec![1, 2, 3]);
}
