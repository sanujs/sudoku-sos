import { Button, FormControlLabel, Checkbox } from "@mui/material";
import { CellState } from "./Sudoku";
import { ChangeEvent } from "react";

type ControlsProps = {
  submitState: boolean;
  handleSubmit: () => Promise<CellState[]>;
  nextHint: (newGS: CellState[]) => CellState[];
  gridState: CellState[];
  setGridState: React.Dispatch<React.SetStateAction<CellState[]>>;
  resubmit: boolean;
  reset: () => void;
  exampleSudoku: () => void;
  showCandidates: boolean;
  handleCandidateCheckbox: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
};
const Controls = (props: ControlsProps) => {
  return (
    <div>
      <Button
        onClick={async () => {
          props.setGridState(await props.handleSubmit());
        }}
        disabled={props.submitState}
      >
        Submit
      </Button>
      <Button
        disabled={!props.submitState}
        onClick={() => {
          if (props.resubmit) {
            props
              .handleSubmit()
              .then((newGS) => props.setGridState(props.nextHint(newGS)));
          } else {
            props.setGridState(props.nextHint(props.gridState));
          }
        }}
      >
        Next
      </Button>
      <Button onClick={props.reset}>Reset</Button>
      <Button onClick={props.exampleSudoku}>Example</Button>
      <FormControlLabel
        control={
          <Checkbox
            checked={props.showCandidates}
            onChange={props.handleCandidateCheckbox}
          />
        }
        label="Generate candidates"
      />
    </div>
  );
};

export default Controls;
