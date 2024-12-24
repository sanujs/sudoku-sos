import {
  Alert,
  Container,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import Puzzle from "./Puzzle";
import { useEffect, useState } from "react";
import StepList from "./StepList";
import Controls from "./Controls";

type ResponseData = {
  solved: boolean;
  grid: GridElement[][];
  steps: Step[];
};

type GridElement = {
  value: number;
  index: number[];
  eliminations: {
    [key: number]: {
      algorithm: string;
      eliminators: number[];
      steps_index: number;
      value: number;
    };
  };
  steps_index: number;
};

export type Step = Solve | Elimination;

type Solve = {
  Solve: {
    index: number[];
    value: number;
    algorithm: string;
  };
};

type Elimination = {
  Elimination: {
    value: number;
    eliminators: number[][];
    steps_index: number;
    victims: number[][];
    algorithm: string;
  };
};

export type CellState = {
  sudokuState: string;
  solvedValue: string | number;
  eliminations: {
    [key: number]: {
      algorithm: string;
      eliminators: number[];
      steps_index: number;
      value: number;
    };
  };
  locked: boolean;
  steps_index: number;
};

const Sudoku = () => {
  const [gridState, setGridState] = useState<CellState[]>(
    Array(81).fill({
      sudokuState: "",
      solvedValue: 0,
      eliminations: [],
      locked: false,
    })
  );
  const [submitState, setSubmitState] = useState(false);
  const [solvedAlert, setSolvedAlert] = useState({
    solved: false,
    visibility: false,
    message: "",
  });
  const [solveOrder, setSolveOrder] = useState<Step[]>([]);
  const [solveOrderIndex, setSolveOrderIndex] = useState<number | null>(null);
  const [showCandidates, setShowCandidates] = useState(true);
  const [resubmit, setResubmit] = useState(false);
  const [newestHintss, setNewestHint] = useState<number[]>([]);

  const handleSubmit = async (): Promise<CellState[]> => {
    const grid: number[][] = [...new Array(9)].map(() => Array(9));
    for (let i = 0; i < 81; i++) {
      grid[Math.floor(i / 9)][i % 9] =
        gridState[i].sudokuState === "" ? 0 : Number(gridState[i].sudokuState);
    }

    console.log("Grid request", grid);
    return await axios.post("https://api.sudokusos.com", grid).then((response) => {
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
      setSolveOrder(data.steps);
      setSolveOrderIndex(-1);
      const newGS = gridState.map((item, i) => {
        const responseItem = data.grid[Math.floor(i / 9)][i % 9];
        return {
          ...item,
          solvedValue: !responseItem.value ? "" : responseItem.value,
          eliminations: responseItem.eliminations,
          locked: true,
          steps_index: responseItem.steps_index,
        };
      });
      setSubmitState(true);
      setResubmit(false);
      return newGS;
    });
  };

  useEffect(() => {
    console.log("Gridstate", gridState);
  }, [gridState]);

  // Converts [row, column] index format to single value between 0-81
  const twoToOneIndex = (arr: number[]): number => {
    return arr[0] * 9 + arr[1];
  };

  function isErroredCell(i: number): boolean {
    const value = gridState[i].sudokuState;
    if (!value) {
      return false;
    }
    for (let j = 0; j < 81; j++) {
      if (i !== j && sameHouse(i, j) && value === gridState[j].sudokuState) {
        return true;
      }
    }
    return false;
  }

  function onCellChange(i: number, newVal: string) {
    // Update candidates
    const newGridState = [...gridState];
    for (let j = 0; j < 81; j++) {
      if (i !== j && sameHouse(i, j)) {
        // Re-introduce candidates
        for (const elim in newGridState[j].eliminations) {
          if (
            twoToOneIndex(newGridState[j].eliminations[elim].eliminators) ===
              i &&
            newGridState[j].eliminations[elim].steps_index === -1
          ) {
            delete newGridState[j].eliminations[elim];
          }
        }
        // Remove newVal from same house candidates
        newGridState[j] = {
          ...newGridState[j],
          eliminations: {
            ...newGridState[j].eliminations,
            [newVal]: {
              value: newVal,
              algorithm: "FilledCell",
              eliminators: [Math.floor(i / 9), i % 9],
              steps_index: -1,
            },
          },
        };
      }
    }
    newGridState[i] = {
      ...gridState[i],
      sudokuState: newVal,
    };
    setGridState(newGridState);
    setResubmit(true);
    setNewestHint([]);
  }

  function deleteCell(i: number) {
    onCellChange(i, "");
  }

  function sameHouse(a: number, b: number) {
    // Same row
    if (Math.floor(a / 9) * 9 === Math.floor(b / 9) * 9) {
      return true;
    }

    // Same column
    if (a % 9 === b % 9) {
      return true;
    }

    // Same box
    if (
      Math.floor(a / 27) === Math.floor(b / 27) &&
      Math.floor((a % 9) / 3) === Math.floor((b % 9) / 3)
    ) {
      return true;
    }
    return false;
  }

  function onStepClick(newSolveOrderIndex: number) {
    const orderedElement: Step = solveOrder[newSolveOrderIndex];
    setSolveOrderIndex(newSolveOrderIndex)
    if ("Solve" in orderedElement) {
      const solvedCellIndex = twoToOneIndex(orderedElement["Solve"]["index"]);
      setNewestHint([solvedCellIndex]);
    } else {
      const newHints: number[] = [];
      for (const hintIndex of orderedElement.Elimination.eliminators) {
        newHints.push(twoToOneIndex(hintIndex));
      }
      setNewestHint(newHints);
    }
    const newGridState: CellState[] = gridState.map((cell: CellState) => {
      return {
        ...cell,
        sudokuState: newSolveOrderIndex >= cell.steps_index ? cell.solvedValue.toString() : "",
      }
    });
    setGridState(newGridState);
  }

  function nextHint(oldGS: CellState[]): CellState[] {
    console.log("index", solveOrderIndex);
    if (
      solveOrderIndex != null &&
      solveOrderIndex >= -1 &&
      solveOrderIndex < solveOrder.length - 1
    ) {
      const newSolveOrderIndex: number = solveOrderIndex + 1;
      const orderedElement: Step = solveOrder[newSolveOrderIndex];
      setSolveOrderIndex(newSolveOrderIndex);
      if ("Solve" in orderedElement) {
        const solvedCellIndex = twoToOneIndex(orderedElement["Solve"]["index"]);
        const newGridState = [...oldGS];
        newGridState[solvedCellIndex] = {
          ...oldGS[solvedCellIndex],
          sudokuState: oldGS[solvedCellIndex].solvedValue.toString(),
          locked: true,
        };
        setNewestHint([solvedCellIndex]);
        return newGridState;
      } else {
        const newHints: number[] = [];
        for (const hintIndex of orderedElement.Elimination.eliminators) {
          newHints.push(twoToOneIndex(hintIndex));
        }
        setNewestHint(newHints);
      }
    }
    return oldGS;
  }

  function getCandidates(i: number): string[] {
    const candidatesObj: string[] = [];
    if (
      solveOrderIndex === null ||
      gridState[i].sudokuState ||
      !showCandidates
    ) {
      return candidatesObj;
    }
    const hintEliminations = gridState[i].eliminations;
    for (let j = 1; j < 10; j++) {
      if (!(j in hintEliminations)) {
        candidatesObj[j] = "candidate";
      } else if (hintEliminations[j].steps_index > solveOrderIndex + 1) {
        candidatesObj[j] = "candidate";
      } else if (
        hintEliminations[j].steps_index === solveOrderIndex + 1 &&
        solveOrderIndex > -1
      ) {
        candidatesObj[j] = "removed";
      }
    }

    return candidatesObj;
  }

  async function handleCandidateCheckbox(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (e.target.checked) {
      setShowCandidates(true);
      if (resubmit) {
        setGridState(
          await handleSubmit().then((newGS) => {
            return newGS;
          })
        );
      }
    }
    setShowCandidates(e.target.checked);
  }

  function reset() {
    setGridState(
      Array(81).fill({
        sudokuState: "",
        solvedValue: 0,
        eliminations: [],
        locked: false,
      })
    );
    setSubmitState(false);
    setSolvedAlert({ ...solvedAlert, visibility: false });
    setSolveOrder([]);
    setSolveOrderIndex(null);
    setNewestHint([]);
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
    <Container className="main">
      <div className="sudoku-columns">
        <Puzzle
          gridState={gridState}
          onCellChange={onCellChange}
          deleteCell={deleteCell}
          handleSubmit={handleSubmit}
          isErroredCell={isErroredCell}
          newestHints={newestHintss}
          setNewestHint={setNewestHint}
          getCandidates={getCandidates}
        ></Puzzle>
        <div className="sidebar">
          <Controls
            submitState={submitState}
            handleSubmit={handleSubmit}
            nextHint={nextHint}
            gridState={gridState}
            setGridState={setGridState}
            resubmit={resubmit}
            reset={reset}
            exampleSudoku={exampleSudoku}
            showCandidates={showCandidates}
            handleCandidateCheckbox={handleCandidateCheckbox}
          ></Controls>
          <StepList
            solveOrder={solveOrder}
            solveOrderIndex={solveOrderIndex}
            newestHints={newestHintss}
            onStepClick={onStepClick}
          ></StepList>
        </div>
      </div>
      <Snackbar
        open={solvedAlert.visibility}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
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
