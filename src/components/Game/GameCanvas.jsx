import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Game from '../../game/core/Game';
import GameHUD from '../UI/GameHUD';
import PauseMenu from '../UI/PauseMenu';

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const navigate = useNavigate();
  
  const [gameState, setGameState] = useState({
    isLoading: true,
    isPaused: false,
    gameStarted: false,
    player1: {
      name: 'Player 1',
      health: 100,
      maxHealth: 100,
      character: null,
      wins: 0
    },
    player2: {
      name: 'Player 2', 
      health: 100,
      maxHealth: 100,
      character: null,
      wins: 0
    },
    round: 1,
    timer: 99,
    winner: null,
    roundWinner: null
  });

  const [loadingProgress, setLoadingProgress] = useState(0);

  // Initialize game
  useEffect(() => {
    const initGame = async () => {
      try {
        // Get character selections from sessionStorage
        const player1Character = JSON.parse(sessionStorage.getItem('player1Character') || 'null');
        const player2Character = JSON.parse(sessionStorage.getItem('player2Character') || 'null');
        
        if (!player1Character || !player2Character) {
          navigate('/select');
          return;
        }

        // Update initial state with character data
        setGameState(prev => ({
          ...prev,
          player1: {
            ...prev.player1,
            character: player1Character,
            name: player1Character.name,
            health: player1Character.stats.health,
            maxHealth: player1Character.stats.health
          },
          player2: {
            ...prev.player2,
            character: player2Character,
            name: player2Character.name,
            health: player2Character.stats.health,
            maxHealth: player2Character.stats.health
          }
        }));

        // Initialize PixiJS game
        gameRef.current = new Game({
          container: canvasRef.current,
          player1Character,
          player2Character,
          onGameStateChange: handleGameStateChange,
          onLoadingProgress: setLoadingProgress
        });

        await gameRef.current.initialize();
        
        setGameState(prev => ({ 
          ...prev, 
          isLoading: false,
          gameStarted: true 
        }));

      } catch (error) {
        console.error('Failed to initialize game:', error);
        navigate('/');
      }
    };

    initGame();

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, [navigate]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleGameStateChange = (newState) => {
    setGameState(prev => ({
      ...prev,
      ...newState
    }));
  };

  const togglePause = () => {
    if (gameRef.current && gameState.gameStarted && !gameState.winner) {
      const newPauseState = !gameState.isPaused;
      setGameState(prev => ({ ...prev, isPaused: newPauseState }));
      
      if (newPauseState) {
        gameRef.current.pause();
      } else {
        gameRef.current.resume();
      }
    }
  };

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.restart();
      setGameState(prev => ({
        ...prev,
        player1: { ...prev.player1, health: prev.player1.maxHealth, wins: 0 },
        player2: { ...prev.player2, health: prev.player2.maxHealth, wins: 0 },
        round: 1,
        timer: 99,
        winner: null,
        roundWinner: null,
        isPaused: false
      }));
    }
  };

  const handleMainMenu = () => {
    navigate('/');
  };

  const handleCharacterSelect = () => {
    navigate('/select');
  };

  if (gameState.isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">
          LOADING MENTOR KOMBAT...
        </div>
        <div className="loading-bar">
          <div 
            className="loading-progress" 
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        <div style={{ 
          color: '#666', 
          fontSize: '0.5rem', 
          marginTop: '1rem' 
        }}>
          {loadingProgress}% Complete
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {/* PixiJS Canvas */}
      <div ref={canvasRef} className="game-canvas" />
      
      {/* React UI Overlay */}
      {gameState.gameStarted && (
        <GameHUD 
          player1={gameState.player1}
          player2={gameState.player2}
          round={gameState.round}
          timer={gameState.timer}
          winner={gameState.winner}
          roundWinner={gameState.roundWinner}
        />
      )}

      {/* Pause Menu */}
      {gameState.isPaused && (
        <PauseMenu
          onResume={togglePause}
          onRestart={handleRestart}
          onCharacterSelect={handleCharacterSelect}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Game Over Screen */}
      {gameState.winner && (
        <div className="pause-menu">
          <h2 style={{ color: '#00ff41', marginBottom: '1rem' }}>
            {gameState.winner} WINS!
          </h2>
          <div style={{ 
            fontSize: '0.7rem', 
            color: '#ccc', 
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Final Score: {gameState.player1.wins} - {gameState.player2.wins}
          </div>
          <div className="pause-buttons">
            <button className="pixel-button" onClick={handleRestart}>
              Play Again
            </button>
            <button className="pixel-button" onClick={handleCharacterSelect}>
              Character Select
            </button>
            <button className="pixel-button" onClick={handleMainMenu}>
              Main Menu
            </button>
          </div>
        </div>
      )}

      {/* Round Transition */}
      {gameState.roundWinner && !gameState.winner && (
        <div className="pause-menu">
          <h2 style={{ color: '#ff6b35', marginBottom: '2rem' }}>
            ROUND {gameState.round} - {gameState.roundWinner} WINS!
          </h2>
          <div style={{ 
            fontSize: '0.6rem', 
            color: '#ccc',
            textAlign: 'center'
          }}>
            Next round starting...
          </div>
        </div>
      )}

      {/* Debug Info (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: '#00ff41',
          padding: '0.5rem',
          fontSize: '0.4rem',
          fontFamily: 'monospace',
          border: '1px solid #333'
        }}>
          <div>Round: {gameState.round}</div>
          <div>Timer: {gameState.timer}</div>
          <div>P1 HP: {gameState.player1.health}/{gameState.player1.maxHealth}</div>
          <div>P2 HP: {gameState.player2.health}/{gameState.player2.maxHealth}</div>
          <div>Paused: {gameState.isPaused ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas; 