import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import MainMenu from './components/UI/MainMenu'
import CharacterSelect from './components/UI/CharacterSelect'
import ArenaSelect from './components/UI/ArenaSelect'
import GameCanvas from './components/Game/GameCanvas'
import MobileWarning from './components/UI/MobileWarning'

function App() {
  const [gameState, setGameState] = useState({
    player1Character: null,
    player2Character: null,
    selectedArena: null,
    gameMode: 'local' // 'local', 'online', 'ai'
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Mobile Warning Overlay */}
      <MobileWarning />
      
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route 
          path="/character-select" 
          element={
            <CharacterSelect 
              gameState={gameState} 
              setGameState={setGameState} 
            />
          } 
        />
        <Route 
          path="/arena-select" 
          element={
            <ArenaSelect 
              gameState={gameState} 
              setGameState={setGameState} 
            />
          } 
        />
        <Route 
          path="/game" 
          element={
            <GameCanvas 
              gameState={gameState} 
              setGameState={setGameState} 
            />
          } 
        />
      </Routes>
    </div>
  )
}

export default App 