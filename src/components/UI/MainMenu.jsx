import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const MainMenu = () => {
  const navigate = useNavigate();
  const [showSubtitle, setShowSubtitle] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSubtitle(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartGame = () => {
    navigate('/select');
  };

  const handleControls = () => {
    alert(`CONTROLS:
    
Player 1:
W/A/S/D - Movement
Space - Light Attack
Enter - Heavy Attack
Shift - Block

Player 2:
Arrow Keys - Movement
NumPad 0 - Light Attack
NumPad 1 - Heavy Attack
NumPad 2 - Block

ESC - Pause Game`);
  };

  return (
    <div className="main-menu">
      <h1>MENTOR KOMBAT</h1>
      {showSubtitle && (
        <p style={{ 
          fontSize: '0.6rem', 
          color: '#ccc', 
          marginBottom: '2rem',
          animation: 'fadeIn 1s ease-in'
        }}>
          nFactorial Edition
        </p>
      )}
      
      <div className="menu-buttons">
        <button className="pixel-button" onClick={handleStartGame}>
          Start Game
        </button>
        <button className="pixel-button" onClick={handleControls}>
          Controls
        </button>
        <button className="pixel-button" onClick={() => window.open('https://nfactorial.school', '_blank')}>
          About nFactorial
        </button>
      </div>

      <div style={{ 
        position: 'absolute', 
        bottom: '2rem', 
        fontSize: '0.4rem', 
        color: '#666' 
      }}>
        Built with React + PixiJS | © 2024 nFactorial
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .menu-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
};

export default MainMenu; 