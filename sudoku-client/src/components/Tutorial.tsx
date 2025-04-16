import { useState } from "react";
import tutorialContent from "../assets/tutorialContent.json";
import { Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

type TutorialProps = {
  closeTutorial: () => void;
};
const Tutorial = (props: TutorialProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const { title, text, image } = tutorialContent[pageIndex];

  return (
    <Card
      variant="outlined"
      sx={{
        width: "80vw",
        maxWidth: "600px",
      }}
    >
      <CardContent>
        <h2>{title}</h2>
        <p>{text}</p>
        {image != "" ? <img src={image} alt={title} /> : null}
        <div>
          <Button
            onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
            disabled={pageIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() =>
              setPageIndex((prev) =>
                Math.min(prev + 1, tutorialContent.length - 1)
              )
            }
            disabled={pageIndex === tutorialContent.length - 1}
          >
            Next
          </Button>
          <Button onClick={props.closeTutorial}>
            <CloseIcon />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Tutorial;
