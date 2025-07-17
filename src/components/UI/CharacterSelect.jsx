import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCharacters } from '../../game/data/characters';

const CharacterSelect = () => {
  const navigate = useNavigate();
  const characters = getAllCharacters();
  
  const [player1Selection, setPlayer1Selection] = useState(null);
  const [player2Selection, setPlayer2Selection] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);

  const handleCharacterSelect = (character) => {
    if (currentPlayer === 1) {
      setPlayer1Selection(character);
      setCurrentPlayer(2);
    } else if (currentPlayer === 2) {
      if (character.id === player1Selection?.id) {
        // Same character selected, allow it but show warning
        setPlayer2Selection(character);
      } else {
        setPlayer2Selection(character);
      }
    }
  };

  const handleFight = () => {
    if (player1Selection && player2Selection) {
      // Store selections in sessionStorage for the game
      sessionStorage.setItem('player1Character', JSON.stringify(player1Selection));
      sessionStorage.setItem('player2Character', JSON.stringify(player2Selection));
      navigate('/fight');
    }
  };

  const handleBack = () => {
    if (currentPlayer === 2 && !player2Selection) {
      setCurrentPlayer(1);
      setPlayer1Selection(null);
    } else {
      navigate('/');
    }
  };

  const renderStatBar = (value, max = 100) => {
    const percentage = (value / max) * 100;
    return (
      <div style={{ 
        width: '100%', 
        height: '8px', 
        background: '#333', 
        border: '1px solid #555',
        marginTop: '2px'
      }}>
        <div style={{ 
          width: `${percentage}%`, 
          height: '100%', 
          background: 'linear-gradient(90deg, #ff0000, #ffff00, #00ff00)',
          transition: 'width 0.3s ease'
        }} />
      </div>
    );
  };

  return (
    <div className="character-select">
      <h1 style={{ textAlign: 'center', marginBottom: '1rem', color: '#00ff41' }}>
        SELECT YOUR FIGHTER
      </h1>
      
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem', 
        fontSize: '0.8rem',
        color: currentPlayer === 1 ? '#00ff41' : '#ff6b35'
      }}>
        {currentPlayer === 1 ? 'PLAYER 1 - Choose your character' : 'PLAYER 2 - Choose your character'}
      </div>

      <div className="character-grid">
        {characters.map((character) => (
          <div
            key={character.id}
            className={`character-card ${
              (currentPlayer === 1 && player1Selection?.id === character.id) ||
              (currentPlayer === 2 && player2Selection?.id === character.id)
                ? 'selected'
                : ''
            }`}
            onClick={() => handleCharacterSelect(character)}
            style={{
              opacity: 
                (currentPlayer === 1 && player1Selection?.id === character.id) ||
                (currentPlayer === 2 && player2Selection?.id === character.id) ||
                (!player1Selection && !player2Selection) ||
                (currentPlayer === 2 && !player2Selection)
                  ? 1 
                  : 0.7
            }}
          >
            <div 
              className="character-portrait"
              style={{ 
                background: `linear-gradient(135deg, ${character.colors.primary}, ${character.colors.secondary})`,
                color: character.colors.accent,
                fontSize: '1.5rem'
              }}
            >
              {character.displayName.split(' ').map(word => word[0]).join('')}
            </div>
            
            <div className="character-name" style={{ color: character.colors.primary }}>
              {character.name}
            </div>
            
            <div style={{ fontSize: '0.5rem', color: '#ccc', marginBottom: '1rem' }}>
              {character.description}
            </div>
            
            <div className="character-stats">
              <div style={{ marginBottom: '0.3rem' }}>
                <span>Health: {character.stats.health}</span>
                {renderStatBar(character.stats.health, 120)}
              </div>
              <div style={{ marginBottom: '0.3rem' }}>
                <span>Attack: {character.stats.attack}</span>
                {renderStatBar(character.stats.attack, 95)}
              </div>
              <div style={{ marginBottom: '0.3rem' }}>
                <span>Defense: {character.stats.defense}</span>
                {renderStatBar(character.stats.defense, 95)}
              </div>
              <div style={{ marginBottom: '0.3rem' }}>
                <span>Speed: {character.stats.speed}</span>
                {renderStatBar(character.stats.speed, 95)}
              </div>
            </div>
            
            {character.moves.special && (
              <div style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.4rem', 
                color: character.colors.primary,
                textAlign: 'center'
              }}>
                Special: {character.moves.special.name}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '2rem',
        padding: '1rem',
        background: 'rgba(0,0,0,0.5)',
        border: '2px solid #333'
      }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ color: '#00ff41', marginBottom: '0.5rem' }}>PLAYER 1</div>
          <div style={{ fontSize: '0.7rem' }}>
            {player1Selection ? player1Selection.name : 'Not Selected'}
          </div>
        </div>
        
        <div style={{ 
          width: '2px', 
          background: '#555', 
          margin: '0 2rem' 
        }} />
        
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ color: '#ff6b35', marginBottom: '0.5rem' }}>PLAYER 2</div>
          <div style={{ fontSize: '0.7rem' }}>
            {player2Selection ? player2Selection.name : 'Not Selected'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '2rem', 
        marginTop: '2rem' 
      }}>
        <button className="pixel-button" onClick={handleBack}>
          Back
        </button>
        
        {player1Selection && player2Selection && (
          <button 
            className="pixel-button" 
            onClick={handleFight}
            style={{ 
              background: '#ff6b35',
              borderColor: '#ff6b35',
              color: '#000',
              boxShadow: '0 0 15px #ff6b35'
            }}
          >
            FIGHT!
          </button>
        )}
      </div>

      {/* Controls Reminder */}
      <div style={{ 
        position: 'absolute', 
        bottom: '1rem', 
        left: '50%', 
        transform: 'translateX(-50%)',
        fontSize: '0.4rem', 
        color: '#666',
        textAlign: 'center'
      }}>
        P1: WASD + Space/Enter | P2: Arrows + NumPad 0/1
      </div>
    </div>
  );
};

export default CharacterSelect; 