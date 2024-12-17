import { List, ListItem, ListItemButton } from '@mui/material';
import { Step } from "./Sudoku";
import { formatAlgorithmString } from "../utils";

type StepListProps = {
  solveOrder: Step[];
  solveOrderIndex: number | null;
  newestHints: number[];
  onStepClick: (i: number) => void;
}
const StepList = (props: StepListProps) => {
  return (
    <div className="steplist">
      <List
        sx={{
          maxHeight: 450,
          overflow: 'auto',
        }}
      >
        {
          props.solveOrder.map((step, index) => {
            const stepType = "Solve" in step ? "solve" : "elimination";
            const algorithm = "Solve" in step ? step.Solve.algorithm : step.Elimination.algorithm;
            const color = props.solveOrderIndex && index < props.solveOrderIndex ? "grey" : "black";
            return <ListItem
              key={index}
              className={stepType}
              sx={{
                color: color,
                padding: 0,
                fontWeight: props.solveOrderIndex == index ? "bold" : "normal",
              }}
            >
              <ListItemButton
                onClick={() => {props.onStepClick(index)}}
              >
                {formatAlgorithmString(algorithm)}
              </ListItemButton>
            </ListItem>
          })
        }
      </List>
    </div>
  );
};

export default StepList;
