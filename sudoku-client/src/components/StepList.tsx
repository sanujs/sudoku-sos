import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Step } from "./Sudoku";

type StepListProps = {
  solveOrder: Step[];
  solveOrderIndex: number | null;
  newestHint: number | null;
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
            const algorithm = "Solve" in step ? step.Solve.algorithm : step.Elimination.algorithm;
            const color = props.solveOrderIndex && index < props.solveOrderIndex ? "grey" : "black";
            return <ListItem key={`key-${index}`} sx={{color: color}}>{algorithm}</ListItem>
          })
        }
      </List>
    </div>
  );
};

export default StepList;
