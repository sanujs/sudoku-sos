use std::collections::{BTreeMap, BTreeSet};

use self::puzzle::{
    cell::{Elimination, EliminationAlgorithm},
    House, Puzzle, SolveAlgorithm, Step,
};
use puzzle::cell::Cell;
use serde::Serialize;
mod puzzle;

#[derive(Serialize)]
pub struct SolveOutput {
    grid: [[Cell; 9]; 9],
    steps: Vec<Step>,
    solved: bool,
}

pub fn solve_puzzle(grid: [[u8; 9]; 9]) -> Result<SolveOutput, SolveOutput> {
    let mut puzzle = Puzzle::new(grid);
    println!("{:?}", puzzle);
    let mut fill_count = 0;
    println!("Empties: {}", puzzle.empty_count);
    loop {
        if fill_count == puzzle.empty_count {
            println!("Done!");
            return Ok(SolveOutput {
                grid: puzzle.grid,
                steps: puzzle.steps,
                solved: true,
            });
        }
        let (mut tmp_elim, mut tmp_fill) = unique_candidate(&mut puzzle);
        fill_count += tmp_fill;
        println!("UNIQUE CANDIDATE");
        println!("Filled: {}", tmp_fill);
        println!("Total filled: {}", fill_count);
        println!("Eliminated: {}", tmp_elim);
        println!("{:?}", puzzle);
        if tmp_elim > 0 || tmp_fill > 0 {
            continue;
        }
        (tmp_elim, tmp_fill) = sole_candidate(&mut puzzle);
        fill_count += tmp_fill;
        println!("SOLE CANDIDATE");
        println!("Filled: {}", tmp_fill);
        println!("Total filled: {}", fill_count);
        println!("Eliminated: {}", tmp_elim);
        println!("{:?}", puzzle);
        if tmp_elim > 0 || tmp_fill > 0 {
            continue;
        }
        tmp_elim = naked_and_hidden_set(&mut puzzle);
        println!("NAKED SET");
        println!("Eliminated: {}", tmp_elim);
        println!("{:?}", puzzle);

        if tmp_elim == 0 {
            return Err(SolveOutput {
                grid: puzzle.grid,
                steps: puzzle.steps,
                solved: false,
            });
        }
    }
}

// Filling Algorithms
// ==================

fn unique_candidate(puzzle: &mut Puzzle) -> (u32, u32) {
    let mut eliminated_count = 0;
    let mut filled_count = 0;
    let unfilled_cells = puzzle.get_unfilled_indices();
    for cell in unfilled_cells {
        let candidates = puzzle.grid[cell.0][cell.1].get_candidates();
        for c in candidates {
            // Begin assuming each candidate is unique in every row, col, and block - then try to disprove it
            let houses = [House::Block, House::Row, House::Column];
            let unique = houses.map(|h| {
                puzzle
                    .get_house_indices(cell.0, cell.1, vec![&h])
                    .iter()
                    .filter(|other_cell| {
                        **other_cell != cell
                            && puzzle.grid[other_cell.0][other_cell.1].contains_candidate(&c)
                    })
                    .count()
                    == 0
            });
            // If this candidate is unique to any row, col, or box then break the loop and fill it
            if unique[0] {
                if let Some(fill_eliminations) =
                    puzzle.fill_cell(cell.0, cell.1, SolveAlgorithm::UniqueBox, c as u8, puzzle.steps.len())
                {
                    eliminated_count += fill_eliminations;
                    filled_count += 1;
                    break;
                }
            } else if unique[1] {
                if let Some(fill_eliminations) =
                    puzzle.fill_cell(cell.0, cell.1, SolveAlgorithm::UniqueRow, c as u8, puzzle.steps.len())
                {
                    eliminated_count += fill_eliminations;
                    filled_count += 1;
                    break;
                }
            } else if unique[2] {
                if let Some(fill_eliminations) =
                    puzzle.fill_cell(cell.0, cell.1, SolveAlgorithm::UniqueCol, c as u8, puzzle.steps.len())
                {
                    eliminated_count += fill_eliminations;
                    filled_count += 1;
                    break;
                }
            }
        }
    }
    (eliminated_count, filled_count)
}

fn sole_candidate(puzzle: &mut Puzzle) -> (u32, u32) {
    let mut eliminated_count = 0;
    let mut filled_count = 0;
    let unfilled_cells = puzzle.get_unfilled_indices();
    for cell in unfilled_cells {
        // Fills cell if only one candidate left
        let candidates = puzzle.grid[cell.0][cell.1].get_candidates();
        if candidates.len() == 1 {
            if let Some(fill_eliminations) = puzzle.fill_cell(
                cell.0,
                cell.1,
                SolveAlgorithm::SoleCandidate,
                candidates[0] as u8,
                puzzle.steps.len(),
            ) {
                eliminated_count += fill_eliminations;
                filled_count += 1;
            }
        }
    }
    (eliminated_count, filled_count)
}

// Eliminating Algorithms
// ==================

fn naked_and_hidden_set(puzzle: &mut Puzzle) -> u32 {
    let mut removed = 0;
    let mut cell: (usize, usize) = (0, 0);
    for _ in 0..9 {
        let houses = [House::Block, House::Row, House::Column];

        for house in houses.iter() {
            let mut state: BTreeMap<BTreeSet<u8>, Vec<(usize, usize)>> = BTreeMap::new();
            // Vector of a house's unfilled cells (row, column, candidates)
            let house_cells: Vec<(usize, usize, BTreeSet<u8>)> =
                puzzle.get_house_indices_with_candidates(cell.0, cell.1, vec![house]);
            for (row, col, candidate_set) in house_cells.iter() {
                let mut next_state = state.clone();
                next_state.entry(candidate_set.clone()).or_insert(vec![(*row, *col)]);

                for key in state.keys() {
                    // Maps every union of every set of candidates -> cells with a set of candidates that is a subset of the key
                    let new_key: BTreeSet<u8> = candidate_set.union(key).copied().collect();
                    if state.contains_key(&new_key) {
                        if !next_state.get(&new_key).unwrap().contains(&(*row, *col)) {
                            next_state.get_mut(&new_key).unwrap().push((*row, *col));
                        }
                    } else {
                        let mut new_val = state.get(key).unwrap().clone();
                        if !new_val.contains(&(*row, *col)) {
                            new_val.push((*row, *col));
                        }
                        next_state.insert(new_key, new_val);
                    };
                }
                state = next_state;
            }

            for key in state.keys() {
                if let Some(value) = state.get(key) {
                    if value.len() >= house_cells.len() {
                        // Number of candidates is greater than or equal to the number of unfilled cells in the house
                        continue;
                    }
                    if value.len() == key.len() {
                        // Naked Set exists
                        let victims: Vec<(usize, usize)> = house_cells.iter().filter(|(row,col, _)| !value.contains(&(*row, *col))).map(|(row, col, _)| (*row, *col)).collect();
                        // Use the algorithm of the smaller between a naked set and it's inverse hidden set
                        let (algorithm, eliminators) = if house_cells.len() - key.len() < key.len() {
                            (EliminationAlgorithm::HiddenSet, victims.clone())
                        } else {
                            (EliminationAlgorithm::NakedSet, value.clone())
                        };
                        // Candidates can be removed from remaining cells in the house
                        for (row, col, candidate_set) in house_cells.iter() {
                            if !candidate_set.is_subset(key) {
                                let remove_candidates = candidate_set.intersection(key);
                                for c in remove_candidates {
                                    if puzzle.grid[*row][*col]
                                        .eliminate_candidate(Elimination {
                                            value: *c as u8,
                                            eliminators: eliminators.clone(),
                                            steps_index: puzzle.steps.len() + 1,
                                            algorithm: algorithm.clone(),
                                        })
                                        .is_some()
                                    {
                                        removed += 1;
                                    }
                                }
                            }
                        }
                        if removed > 0 {
                            // complex algorithm needs to be pushed to puzzle's solve order
                            puzzle.steps.push(Step::Elimination {
                                value: key.into_iter().map(|c| *c).collect(),
                                algorithm: algorithm,
                                eliminators: eliminators,
                                victims,
                                steps_index: puzzle.steps.len() + 1,
                            });
                            return removed;
                        }
                    }
                }
            }
        }
        // Ensures next cell is in a different row, column, and box
        cell = if cell.1 > 4 {
            (cell.0 + 1, cell.1 - 5)
        } else {
            (cell.0 + 1, cell.1 + 4)
        };
    }
    removed
}
