import "./App.css";
import Sudoku from "./components/Sudoku";
import githubMarkWhite from "./assets/githubMarkWhite.png";
import { Backdrop } from "@mui/material";
import { useState } from "react";
import Tutorial from "./components/Tutorial";

function App() {
  const [tutorial, setTutorial] = useState(false);

  function onHelpClick() {
    setTutorial(true);
  }

  function closeTutorial() {
    setTutorial(false);
  }

  return (
    <>
      <header className="quicksand-title">Sudoku SOS</header>
      <Sudoku onHelpClick={onHelpClick} />
      <Backdrop open={tutorial}>
        <Tutorial closeTutorial={closeTutorial} />
      </Backdrop>
      <footer>
        <a href="https://github.com/sanujs/sudoku-sos">
          <img
            src={githubMarkWhite}
            alt="GitHub Repository"
            width="20"
            height="20"
          />
        </a>
      </footer>
    </>
  );
}

export default App;
