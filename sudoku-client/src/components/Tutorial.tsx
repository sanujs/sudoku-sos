import { Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

type TutorialProps = {
  closeTutorial: () => void;
};
const Tutorial = (props: TutorialProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        width: "80vw",
        maxWidth: "600px",
        position: "relative",
      }}
    >
      <CardContent>
        <div>
          <Button
            onClick={props.closeTutorial}
            sx={{
              position: "absolute",
              top: "10px",
              right: "10px",
              color: "black",
            }}
          >
            <CloseIcon />
          </Button>
        </div>
        <h2>Welcome to Sudoku SOS</h2>
        <p>
          This tool is made to help you solve any Sudoku and show you every
          step!
        </p>
        <ol>
          <li>Input your Sudoku (or use one of our examples).</li>
          <li>Click 'Submit'.</li>
          <li>
            Click 'Next' to iterate through solving steps, or click any step to
            jump to that step.
          </li>
          <li>Click 'Reset' to solve another Sudoku!</li>
        </ol>
      </CardContent>
    </Card>
  );
};

export default Tutorial;
