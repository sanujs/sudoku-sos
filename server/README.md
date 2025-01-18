# Server

The backend Rust server that solves the sudoku and tracks the steps required.

## Getting Started

### Docker

Due to the use of GitHub Workflows for continuous delivery, the Dockerfile is configured so that docker commands are expected to be run from the root directory (the parent of this directory).

```bash
docker build -t sudoku -f server/Dockerfile .
docker run -p 80:80 sudoku
```

### Cargo
Alternatively you can use cargo to run the server locally. `cargo run` (in this directory) will run an HTTP server at http://localhost:80/ that will accept a POST request with a JSON payload of a 9x9 2D array of unsigned integers (unfilled cells being indicated with the number 0) and return a JSON payload of the following structure:

```
{
    solved: Boolean indicating whether the Sudoku was solved
    grid: 9x9 2D array of "cells"
    steps: Ordered list of each "step"
}
```
A "cell" is an object with the following properties:
```
{
    value: The final solution of this cell
    eliminations: A map of each eliminated candidate with the reason and the step index
    index: Location of the cell in the 2D array (row, column)
    steps_index: The step where this cell is solved (as an index in the steps list)
}
```

A "step" can be one of two things:
- An unfilled cell being solved (or "filled")
- The elimination of a candidate 
    - This excludes eliminations from a filled cell being in the same house (row/column/block) since those are frequent, easy to indentify, and would clutter the final step list
