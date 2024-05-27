import { Alert, Button, Checkbox, Container, FormControlLabel, Grid, Snackbar } from "@mui/material";
import axios from "axios";
import Puzzle from "./Puzzle";
import { useEffect, useState } from "react";

type ResponseData = {
  solved: boolean,
  grid: number[][],
  steps: Step[],
}

type Step = Solve | Elimination

type Solve = {
  Solve: {
    index: number[],
    value: number,
    algorithm: string,
  }
}

type Elimination = {
  Elimination: {
    value: number,
    eliminators: number[][],
    steps_index: number,
    victims: number[][],
    algorithm: string,
  }
}

export type CellState = {
  sudokuState: string,
  solvedValue: string|number,
  reductions: never,
}

const Sudoku = () => {
  const [gridState, setGridState] = useState<CellState[]>(
    Array(81).fill({
      sudokuState: "",
      solvedValue: 0,
      reductions: [],
    })
  );
  const [submitState, setSubmitState] = useState(false);
  const [solvedAlert, setSolvedAlert] = useState({
    solved: false,
    visibility: false,
    message: "",
  });
  const [solveOrder, setSolveOrder] = useState<Step[]>([]);
  const [solveOrderIndex, setSolveOrderIndex] = useState<number|null>(null);
  const [showCandidates, setShowCandidates] = useState(true);

  const handleSubmit = () => {
    const grid: number[][] = [...new Array(9)].map(() => Array(9));
    for (let i = 0; i < 81; i++) {
      grid[Math.floor(i / 9)][i % 9] =
        gridState[i].sudokuState === "" ? 0 : Number(gridState[i].sudokuState);
    }
    
    console.log(grid);
    axios.post("http://127.0.0.1:8080", grid).then((response) => {
      console.log(response);
      const data: ResponseData = response.data;
      if (data.solved) {
        setSolvedAlert({
          solved: true,
          visibility: true,
          message: "Solution found",
        });
      } else {
        setSolvedAlert({
          solved: false,
          visibility: true,
          message: "Unable to solve",
        });
      }
      const arrayResponse = data.grid;
      setSolveOrder(data.steps);
      setSolveOrderIndex(-1);
      setGridState(
        gridState.map((item, i) => {
          return {
            ...item,
            solvedValue: !arrayResponse[Math.floor(i / 9)][i % 9]
              ? ""
              : arrayResponse[Math.floor(i / 9)][i % 9],
          };
        })
      );
      setSubmitState(true);
    });
  }

  useEffect(() => {
    console.log("Gridstate", gridState);
  }, [gridState]);

  // Converts [row, column] index format to single value between 0-81
  const twoToOneIndex = (arr: number[]): number => {
    return arr[0] * 9 + arr[1];
  }

  function isErroredCell(i: number): boolean {
    const value = gridState[i].sudokuState;
    if (!value || submitState) {
      return false;
    }
    for (let j = 0; j<81; j++) {
      if (i!==j && sameHouse(i, j) && value === gridState[j].sudokuState) {
        return true;
      }
    }
    return false;
  }

  function onCellChange(i: number, newVal: string) {
    const newGridState = [...gridState];
    newGridState[i] = {
      ...gridState[i],
      sudokuState: newVal,
    };
    setGridState(newGridState);
  }

  function deleteCell(i: number) {
    const newGridState = [...gridState];
    newGridState[i] = {
      ...gridState[i],
      sudokuState: "",
    };
    setGridState(newGridState);
  }

  function sameHouse(a: number, b: number) {
    // Same row
    if (Math.floor(a / 9) * 9 === Math.floor(b / 9) * 9) {
      return true;
    }

    // Same column
    if (a%9 === b%9) {
      return true;
    }

    // Same box
    if (Math.floor(a/27) === Math.floor(b/27) && Math.floor(a%9/3) === Math.floor(b%9/3)) {
      return true;
    }
    return false;
  }

  function nextHint() {
    if (!solveOrder || solveOrderIndex === null || !submitState) {
      // TODO: disable next hint button
      return;
    } else if (
      solveOrderIndex >= -1 &&
      solveOrderIndex < solveOrder.length - 1
    ) {
      let newSolveOrderIndex: number = solveOrderIndex + 1;
      let orderedElement: Step = solveOrder[newSolveOrderIndex];
      const newReductionList = [];
      while ("Elimination" in orderedElement) {
        newReductionList.push(orderedElement["Elimination"]);
        orderedElement = solveOrder[++newSolveOrderIndex];
      }
      // setCurrentReductions([...newReductionList]);
      const solvedCellIndex = twoToOneIndex(orderedElement["Solve"]["index"]);
      const newGridState = [...gridState];
      newGridState[solvedCellIndex] = {
        ...gridState[solvedCellIndex],
        sudokuState: gridState[solvedCellIndex].solvedValue.toString(),
      };
      setGridState(newGridState);
      setSolveOrderIndex(newSolveOrderIndex);
    }
  }

  function isNewestHintCell(i: number): boolean {
    if (
      !solveOrder ||
      solveOrderIndex === null ||
      !solveOrder[solveOrderIndex]
    ) {
      return false;
    }
    const solveStep: Step = solveOrder[solveOrderIndex];
    if ("Solve" in solveStep) {
      return i === twoToOneIndex(solveStep["Solve"]["index"]);
    }
    return false;
  }

  function getCandidates(i: number) {
    const candidatesObj = {};
    if (
      solveOrderIndex === null ||
      gridState[i].sudokuState ||
      !showCandidates
    ) {
      return candidatesObj;
    }
    const hintReductions = gridState[i].reductions;
    for (let j = 1; j < 10; j++) {
      if (!(j in hintReductions)) {
        candidatesObj[j] = "candidate";
      } else if (hintReductions[j].reduced_at > solveOrderIndex+1) {
        candidatesObj[j] = "candidate";
      } else if (hintReductions[j].reduced_at === solveOrderIndex+1) {
        candidatesObj[j] = "removed";
      }
    }

    return candidatesObj;
  }

  function handleCandidateCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    setShowCandidates(e.target.checked);
  }

  function reset() {
    setGridState(
      Array(81).fill({
        sudokuState: "",
        solvedValue: 0,
        reductions: [],
      })
    );
    setSubmitState(false);
    setSolvedAlert({ ...solvedAlert, visibility: false });
    setSolveOrder([]);
    setSolveOrderIndex(null);
    // setCurrentReductions([]);
  }

  function exampleSudoku() {
    const example1 =
      "000000600000036010300010507670004001003060008102000456064080100001007900500000760";
    // "215608430060001200000000001506300104901000300300162500700010040100006000602405713";
    reset();
    setGridState(
      gridState.map((item, index) => {
        return {
          ...item,
          sudokuState: example1[index] === "0" ? "" : example1[index],
        };
      })
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: "95vw",
      }}
    >
      <Grid className="puzzle-list-column">
        <Puzzle
          gridState={gridState}
          onCellChange={onCellChange}
          deleteCell={deleteCell}
          handleSubmit={handleSubmit}
          submitted={submitState}
          isErroredCell={isErroredCell}
          isNewestHintCell={isNewestHintCell}
          getCandidates={getCandidates}
        ></Puzzle>
      </Grid>
      <Button onClick={handleSubmit} disabled={submitState}>
        Submit
      </Button>
      <Button disabled={!submitState} onClick={nextHint}>
        Hint
      </Button>
      <Button onClick={reset}>Reset</Button>
      <Button onClick={exampleSudoku}>Example</Button>
      <FormControlLabel
        control={
          <Checkbox
            checked={showCandidates}
            onChange={handleCandidateCheckbox}
          />
        }
        label="Show candidates"
      />
      <Snackbar open={solvedAlert.visibility}>
        <Alert
          severity={solvedAlert.solved ? "success" : "error"}
          onClose={() => setSolvedAlert({ ...solvedAlert, visibility: false })}
        >
          {solvedAlert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Sudoku;
