use std::collections::hash_map::Entry::Vacant;
use std::collections::HashMap;

use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Cell {
    pub value: u8,
    pub eliminations: HashMap<u8, Elimination>,
    pub index: (usize, usize),
}

#[derive(Debug, Serialize)]
pub struct Elimination {
    pub value: u8,
    pub eliminators: Vec<(usize, usize)>,
    pub steps_index: usize,
    pub algorithm: EliminationAlgorithm,
}

#[derive(Debug, Serialize)]
pub enum EliminationAlgorithm {
    FilledCell,
    NakedSet,
}

impl Cell {
    pub fn fill(&mut self, value: u8) -> Option<u8> {
        if self.value == 0 {
            self.value = value;
            Some(self.value)
        } else {
            None
        }
    }

    pub fn eliminate_candidate(&mut self, elim: Elimination) -> Option<u8> {
        let elim_value = elim.value;
        if self.value > 0 {
            return None;
        }
        if let Vacant(e) = self.eliminations.entry(elim_value) {
            e.insert(elim);
            Some(elim_value)
        } else {
            None
        }
    }

    pub fn get_candidates(&self) -> Vec<u8> {
        let mut candidates: Vec<u8> = vec![];
        for candidate in 1..10 {
            if !self.eliminations.contains_key(&candidate) {
                candidates.push(candidate);
            }
        }
        candidates
    }

    pub fn contains_candidate(&self, candidate: &u8) -> bool {
        !self.eliminations.contains_key(candidate)
    }
}
