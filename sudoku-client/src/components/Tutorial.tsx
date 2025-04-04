import { useState } from "react";
import tutorialContent from "../assets/tutorialContent.json";
import { Button } from "@mui/material";

type TutorialProps = {
  closeTutorial: () => void;
}
const Tutorial = (props: TutorialProps) => {
  const [pageIndex, setPageIndex] = useState(1);
  const { title, text, image } = tutorialContent[pageIndex];

  return (
    <div>
      <Button
        onClick={props.closeTutorial}
      >Close</Button>
      <h2>{title}</h2>
      <p>{text}</p>
      {image != "" ?  <img src={image} alt={title} /> : null}
      <div>
        <Button 
          onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
          disabled={pageIndex === 0}
        >
          Previous
        </Button>
        <Button 
          onClick={() => setPageIndex((prev) => Math.min(prev + 1, tutorialContent.length - 1))}
          disabled={pageIndex === tutorialContent.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Tutorial;