import Cell from "./Cell";
import { MutableRefObject, createRef, useRef } from "react";
import { Grid } from "@mui/material";
import { CellState } from "./Sudoku";

type PuzzleProps = {
  gridState: CellState[],
  onCellChange: (i: number, newVal: string) => void,
  deleteCell: (i: number) => void,
  handleSubmit: () => void,
  isErroredCell: (i: number) => boolean,
  newestHint: number|null,
  getCandidates: (i: number) => string[],
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
        locked={props.gridState[i].locked}
        error={props.isErroredCell(i)}
        next={props.newestHint==i}
        candidates={props.getCandidates(i)}
      />
    );
  }
  return (
    <Grid className="puzzle-grid">{sudoku_grid}</Grid>
  );
};
export default Puzzle;
