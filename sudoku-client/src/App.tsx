import './App.css'
import Sudoku from './components/Sudoku'
import githubMarkWhite from './assets/githubMarkWhite.png'

function App() {

  return (
    <>
      <header className='quicksand-title'>
        Sudoku SOS
      </header>
      <Sudoku/>
      <footer>
        <a href='https://github.com/sanujs/sudoku-sos'>
          <img
            src={githubMarkWhite}
            alt='GitHub Repository'
            width='20'
            height='20'
          />
        </a>
      </footer>
    </>
  )
}

export default App
