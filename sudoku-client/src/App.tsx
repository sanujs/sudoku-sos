import './App.css'
import Sudoku from './components/Sudoku'

function App() {

  return (
    <>
      <header className='quicksand-title'>
        Sudoku SOS
      </header>
      <Sudoku/>
      <footer>
        <a href='https://github.com/sanujs/sudoku-sos'>GitHub</a>
      </footer>
    </>
  )
}

export default App
