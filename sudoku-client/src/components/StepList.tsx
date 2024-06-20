import Card from "@mui/material/Card";
import { Step } from "./Sudoku";

type StepListProps = {
  solveOrder: Step[];
  solveOrderIndex: number | null;
  newestHint: number | null;
}
const StepList = (props: StepListProps) => {
  const list = [];
  if (props.newestHint && props.solveOrderIndex) {
    const nextStep = props.solveOrder[props.solveOrderIndex];
    if (nextStep && "Solve" in nextStep) {
      list.push(
        <Card variant="outlined">{nextStep.Solve.algorithm}</Card>
      )
    }
  }
  return (
    <div className="steplist">
      {list}
    </div>
  );
};

export default StepList;
