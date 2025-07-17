import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainMenu from './components/UI/MainMenu';
import CharacterSelect from './components/UI/CharacterSelect';
import GameCanvas from './components/Game/GameCanvas';
import './App.css';
import './styles/game.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/select" element={<CharacterSelect />} />
          <Route path="/fight" element={<GameCanvas />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
