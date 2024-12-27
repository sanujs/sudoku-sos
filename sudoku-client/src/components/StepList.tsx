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
    <List
      className="steplist"
      sx={{
        maxHeight: 465,
        overflow: 'auto',
        padding: 0,
        scrollbarWidth: 'thin',
      }}
    >
      {
        props.solveOrder.map((step, index) => {
          const stepType = "Solve" in step ? "solve" : "elimination";
          const algorithm = "Solve" in step ? step.Solve.algorithm : step.Elimination.algorithm;
          const color = props.solveOrderIndex && index < props.solveOrderIndex ? "old" : "new";
          return <ListItem
            key={index}
            className={stepType + " " + color}
            sx={{
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
  );
};

export default StepList;
