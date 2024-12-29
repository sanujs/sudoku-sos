pub mod cell;
use arrayvec::ArrayVec;
use serde::Serialize;
use std::{
    collections::{BTreeSet, HashMap},
    fmt, vec,
};

use self::cell::{Cell, Elimination, EliminationAlgorithm};

pub struct Puzzle {
    pub grid: [[Cell; 9]; 9],
    pub steps: Vec<Step>,
    pub empty_count: u32,
}

#[derive(Serialize, Debug)]
pub enum Step {
    Elimination {
        value: Vec<u8>,
        eliminators: Vec<(usize, usize)>,
        steps_index: usize,
        victims: Vec<(usize, usize)>,
        algorithm: EliminationAlgorithm,
    },
    Solve {
        index: (usize, usize),
        value: u8,
        algorithm: SolveAlgorithm,
        steps_index: usize,
    },
}

#[derive(Serialize, Debug)]
pub enum SolveAlgorithm {
    SoleCandidate,
    UniqueRow,
    UniqueCol,
    UniqueBox,
}

pub enum House {
    Row,
    Column,
    Block,
}

impl Puzzle {
    pub fn new(input_grid: [[u8; 9]; 9]) -> Self {
        let mut vec_puzzle = ArrayVec::<[Cell; 9], 9>::new();
        let mut empty_count: u32 = 0;
        for (r_index, row) in input_grid.iter().enumerate() {
            let mut inner_ar = ArrayVec::<Cell, 9>::new();
            for (c_index, element) in row.iter().enumerate() {
                inner_ar.push(Cell {
                    value: *element,
                    eliminations: HashMap::new(),
                    index: (r_index, c_index),
                    steps_index: 0,
                });
                if *element == 0 {
                    empty_count += 1;
                }
            }
            match inner_ar.into_inner() {
                Ok(ar) => vec_puzzle.push(ar),
                Err(vec) => {
                    // Could recover better: manually create an empty array or
                    // derive Copy trait for Cells
                    panic!("Can't push this initialized row to the puzzle: {:?}", vec);
                }
            }
        }
        let steps: Vec<Step> = vec![];
        match vec_puzzle.into_inner() {
            Ok(grid) => {
                let mut new_self = Self {
                    grid,
                    steps,
                    empty_count,
                };
                new_self.initialize();
                new_self
            }
            Err(vec) => {
                panic!("Can't convert 2D ArrayVec to standard array: {:?}", vec);
            }
        }
    }

    fn initialize(&mut self) -> u32 {
        let mut removed = 0;
        let filled_cells = self.get_filled_indices();
        println!("filled cells: {:?}", filled_cells);
        for cell in filled_cells {
            removed += self.post_fill_eliminations(cell.0, cell.1);
        }
        removed
    }

    /* Fills a cell in the puzzle */
    pub fn fill_cell(
        &mut self,
        row: usize,
        col: usize,
        algorithm: SolveAlgorithm,
        value: u8,
        steps_index: usize,
    ) -> Option<u32> {
        match self.grid[row][col].fill(value as u8, steps_index) {
            Some(_) => {
                self.steps.push(Step::Solve {
                    index: (row, col),
                    value,
                    algorithm,
                    steps_index,
                });
                Some(self.post_fill_eliminations(row, col))
            }
            None => None,
        }
    }

    /* Eliminates candidates from related houses after a cell is filled */
    fn post_fill_eliminations(&mut self, row: usize, col: usize) -> u32 {
        let mut removed = 0;
        let mut indices =
            self.get_house_indices(row, col, vec![&House::Row, &House::Column, &House::Block]);
        while let Some(cell) = indices.pop() {
            if self.grid[cell.0][cell.1]
                .eliminate_candidate(Elimination {
                    value: self.grid[row][col].value,
                    eliminators: vec![(row, col)],
                    steps_index: self.steps.len(),
                    algorithm: EliminationAlgorithm::FilledCell,
                })
                .is_some()
            {
                removed += 1;
            }
        }
        removed
    }

    /*
    Returns the indexes of the unfilled cells within the houses specified
    */
    pub fn get_house_indices(
        &self,
        row: usize,
        col: usize,
        houses: Vec<&House>,
    ) -> Vec<(usize, usize)> {
        let mut indices = vec![];
        for house in houses {
            match house {
                House::Block => indices.append(&mut self.get_block_indices(row, col)),
                House::Row => indices.append(&mut self.get_row_indices(row)),
                House::Column => indices.append(&mut self.get_column_indices(col)),
            }
        }
        indices
    }

    /*
    Returns the indexes of the unfilled cells within the houses specified
    along with a BTreeSet of candidates
    */
    pub fn get_house_indices_with_candidates(
        &self,
        row: usize,
        col: usize,
        houses: Vec<&House>,
    ) -> Vec<(usize, usize, BTreeSet<u8>)> {
        let mut indices = vec![];
        for house in houses {
            match house {
                House::Block => {
                    indices.append(&mut self.get_block_indices_with_candidates(row, col))
                }
                House::Row => indices.append(&mut self.get_row_indices_with_candidates(row)),
                House::Column => indices.append(&mut self.get_column_indices_with_candidates(col)),
            }
        }
        indices
    }

    fn get_block_indices(&self, row: usize, col: usize) -> Vec<(usize, usize)> {
        let mut indices = vec![];
        for i in 0..9 {
            let next_index = (3 * (row / 3) + i / 3, 3 * (col / 3) + (i - (i / 3) * 3));
            if self.grid[next_index.0][next_index.1].value > 0 {
                continue;
            }
            indices.push(next_index);
        }
        indices
    }

    fn get_block_indices_with_candidates(
        &self,
        row: usize,
        col: usize,
    ) -> Vec<(usize, usize, BTreeSet<u8>)> {
        let mut indices = vec![];
        for i in 0..9 {
            let next_index = (3 * (row / 3) + i / 3, 3 * (col / 3) + (i - (i / 3) * 3));
            if self.grid[next_index.0][next_index.1].value > 0 {
                continue;
            }
            let next_element = (
                next_index.0,
                next_index.1,
                self.grid[next_index.0][next_index.1]
                    .get_candidates()
                    .iter()
                    .cloned()
                    .collect::<BTreeSet<u8>>(),
            );
            indices.push(next_element);
        }
        indices
    }

    fn get_row_indices(&self, row: usize) -> Vec<(usize, usize)> {
        let mut indices = vec![];
        for i in 0..9 {
            if self.grid[row][i].value > 0 {
                continue;
            }
            indices.push((row, i));
        }
        indices
    }

    fn get_row_indices_with_candidates(&self, row: usize) -> Vec<(usize, usize, BTreeSet<u8>)> {
        let mut indices = vec![];
        for i in 0..9 {
            if self.grid[row][i].value > 0 {
                continue;
            }
            let next_element = (
                row,
                i,
                self.grid[row][i]
                    .get_candidates()
                    .iter()
                    .cloned()
                    .collect::<BTreeSet<u8>>(),
            );
            indices.push(next_element);
        }
        indices
    }

    fn get_column_indices(&self, col: usize) -> Vec<(usize, usize)> {
        let mut indices = vec![];
        for i in 0..9 {
            if self.grid[i][col].value > 0 {
                continue;
            }
            indices.push((i, col));
        }
        indices
    }

    fn get_column_indices_with_candidates(&self, col: usize) -> Vec<(usize, usize, BTreeSet<u8>)> {
        let mut indices = vec![];
        for i in 0..9 {
            if self.grid[i][col].value > 0 {
                continue;
            }
            let next_element = (
                i,
                col,
                self.grid[i][col]
                    .get_candidates()
                    .iter()
                    .cloned()
                    .collect::<BTreeSet<u8>>(),
            );
            indices.push(next_element);
        }
        indices
    }

    /* Creates a vector of the indices of every unfilled cell in the puzzle */
    pub fn get_unfilled_indices(&self) -> Vec<(usize, usize)> {
        self.grid
            .iter()
            .flatten()
            .filter(|cell| cell.value == 0)
            .map(|cell| cell.index)
            .collect::<Vec<(usize, usize)>>()
    }

    /* Creates a vector of the indices of every filled cell in the puzzle */
    pub fn get_filled_indices(&self) -> Vec<(usize, usize)> {
        self.grid
            .iter()
            .flatten()
            .filter(|cell| cell.value > 0)
            .map(|cell| cell.index)
            .collect::<Vec<(usize, usize)>>()
    }
}

impl fmt::Debug for Puzzle {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        writeln!(f, "{{")?;
        for row in 0..9 {
            if row == 3 || row == 6 {
                writeln!(f, " -----------------------")?;
            }
            write!(f, "[ ")?;
            for col in 0..9 {
                if col == 3 || col == 6 {
                    write!(f, "| ")?;
                }
                if self.grid[row][col].value == 0 {
                    write!(f, "_ ")?;
                } else {
                    write!(f, "{} ", self.grid[row][col].value)?;
                }
            }
            writeln!(f, "]")?;
        }
        write!(f, "}}")
    }
}
