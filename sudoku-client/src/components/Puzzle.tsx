import Cell from "./Cell";
import { MutableRefObject, createRef, useRef } from "react";
import { Grid } from "@mui/material";
import { CellState } from "./Sudoku";

type PuzzleProps = {
  gridState: CellState[],
  onCellChange: (i: number, newVal: string) => void,
  deleteCell: (i: number) => void,
  handleSubmit: () => void,
  submitted: boolean,
  isErroredCell: (i: number) => boolean,
  isNewestHintCell: (i: number) => boolean,
  getCandidates: (i: number) => object,
}
const Puzzle = (props: PuzzleProps) => {
  function changeFocus(i: number) {
    if (cellRefs.current[i].current) {
      cellRefs.current[i].current.focus();

    }
  }

  function onCellChange(i: number, newVal: string) {
    props.onCellChange(i, newVal);
    if (i<80) {
      changeFocus(i+1);
    }
  }
  const sudoku_grid = [];
  const cellRefs: MutableRefObject<MutableRefObject<HTMLInputElement|null>[]> = useRef([]);
  for (let i = 0; i < 81; i++) {
    cellRefs.current[i] = createRef();
    sudoku_grid.push(
      <Cell
        index={i}
        key={i}
        value={props.gridState[i].sudokuState}
        onCellChange={onCellChange}
        deleteCell={props.deleteCell}
        changeFocus={changeFocus}
        handleSubmit={props.handleSubmit}
        cellRef={cellRefs.current[i]}
        submitted={props.submitted}
        error={props.isErroredCell(i)}
        next={props.isNewestHintCell(i)}
        candidates={props.getCandidates(i)}
      />
    );
  }
  return (
    <Grid className="puzzle-grid">{sudoku_grid}</Grid>
  );
};
export default Puzzle;
