import React from 'react';

const PauseMenu = ({ onResume, onRestart, onCharacterSelect, onMainMenu }) => {
  return (
    <div className="pause-menu">
      <h2>GAME PAUSED</h2>
      <div className="pause-buttons">
        <button className="pixel-button" onClick={onResume}>
          Resume
        </button>
        <button className="pixel-button" onClick={onRestart}>
          Restart Round
        </button>
        <button className="pixel-button" onClick={onCharacterSelect}>
          Character Select
        </button>
        <button className="pixel-button" onClick={onMainMenu}>
          Main Menu
        </button>
      </div>
      <div style={{ 
        marginTop: '2rem', 
        fontSize: '0.5rem', 
        color: '#666',
        textAlign: 'center'
      }}>
        Press ESC to resume
      </div>
    </div>
  );
};

export default React.memo(PauseMenu); 