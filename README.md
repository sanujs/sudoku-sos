# sudoku-sos

`sudoku-sos` is a Rust application that uses human solving strategies to solve your Sudoku.

Currently implements the following solving strategies:
- Sole Candidates
- Unique Candidates
- Naked Sets
    - the algorithm is generalized and therefore identifies Naked Pairs, Triples, Quadruples, etc

## Getting Started

### `cargo run`
`cargo run` will run an HTTP server at http://localhost:8080/ that will accept an HTTP request with a JSON payload of a 9x9 2D array of unsigned integers (unfilled cells being indicated with the number 0) and return a JSON payload of the following structure:

```
{
    "solved": Boolean indicating whether the Sudoku was solved
    "grid": 9x9 2D array of solved sudoku (or the program's best attempt)
    "steps": Ordered list of each "step"
}
```

In this context, a "step" can be one of two things:
- An unfilled cell being solved (or "filled")
- The elimination of a candidate 
    - This excludes eliminations from a filled cell being in the same house (row/column/block) since those are frequent and easy to indentify
