import { Button, FormControlLabel, Checkbox, ButtonProps, Typography } from "@mui/material";
import { CellState } from "./Sudoku";
import { ChangeEvent } from "react";
import { styled } from "@mui/material/styles";

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
const SubmitButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText("#262c44"),
  backgroundColor: "#262c44",
  '&:hover': {
    backgroundColor: "#4c587d",
  },
  fontFamily: "Nunito Sans",
}));
const DefaultButton = styled(Button)(() => ({
  color: "lightgrey",
  fontFamily: "Nunito Sans",
  '&:hover': {
    backgroundColor: "#262c44",
  }
}));
const Controls = (props: ControlsProps) => {
  return (
    <div className="controls">
      <div className="buttons">
        <DefaultButton
          onClick={props.exampleSudoku}
          disabled={props.submitState}
          className={"nunito-sans-controls"}
        >
          Example
        </DefaultButton>
        <DefaultButton
          className="nunito-sans-controls"
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
        </DefaultButton>
        <DefaultButton onClick={props.reset}>Reset</DefaultButton>
        <SubmitButton
          className="nunito-sans-controls"
          variant="contained"
          onClick={async () => {
            props.setGridState(await props.handleSubmit());
          }}
          disabled={props.submitState}
        >
          Submit
        </SubmitButton>
      </div>
      <FormControlLabel
        sx={{
          typography: {
            fontFamily: "Nunito Sans",
          }
        }}
        control={
          <Checkbox
            sx={{
              color: "#4c587d",
              '&.Mui-checked': {
                color: "lightgrey",
              },
            }}
            checked={props.showCandidates}
            onChange={props.handleCandidateCheckbox}
          />
        }
        label={<Typography sx={{fontFamily: "Nunito Sans"}}>Generate candidates</Typography>}
      />
    </div>
  );
};

export default Controls;
