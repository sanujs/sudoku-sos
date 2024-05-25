import Cell from "./Cell";
import { createRef, useRef } from "react";
import { Grid } from "@mui/material";
const Puzzle = (props) => {
  function changeFocus(i) {
    cellRefs.current[i].current.firstChild.firstChild.focus();
  }

  function onCellChange(i, newVal) {
    props.onCellChange(i, newVal);
    if (i<80) {
      changeFocus(i+1);
    }
  }
  const sudoku_grid = [];
  const cellRefs = useRef([]);
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
        setClickedCell={props.setClickedCell}
        candidates={props.getCandidates(i)}
      />
    );
  }
  return (
    <Grid className="puzzle-grid">{sudoku_grid}</Grid>
  );
};
export default Puzzle;
