import { Button, ButtonProps } from "@mui/material";
import { CellState } from "./Sudoku";
import { styled } from "@mui/material/styles";

type ControlsProps = {
  submitState: boolean;
  handleSubmit: () => void;
  nextHint: (newGS: CellState[]) => CellState[];
  gridState: CellState[];
  setGridState: React.Dispatch<React.SetStateAction<CellState[]>>;
  reset: () => void;
  exampleSudoku: () => void;
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
        >
          Example
        </DefaultButton>
        <DefaultButton
          disabled={!props.submitState}
          onClick={() => {
            props.setGridState(props.nextHint(props.gridState));
          }}
        >
          Next
        </DefaultButton>
        <DefaultButton onClick={props.reset}>Reset</DefaultButton>
        <SubmitButton
          variant="contained"
          onClick={() => props.handleSubmit()}
          disabled={props.submitState}
        >
          Submit
        </SubmitButton>
      </div>
    </div>
  );
};

export default Controls;
