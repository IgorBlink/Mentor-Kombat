import React from 'react';

const GameHUD = ({ player1, player2, round, timer, winner, roundWinner }) => {
  const renderHealthBar = (player, isPlayer2 = false) => {
    const healthPercentage = (player.health / player.maxHealth) * 100;
    const healthColor = 
      healthPercentage > 60 ? '#00ff00' : 
      healthPercentage > 30 ? '#ffff00' : 
      '#ff0000';

    return (
      <div className={`player-hud ${isPlayer2 ? 'player2' : ''}`}>
        <div className="player-name" style={{ color: player.character?.colors?.primary || '#00ff41' }}>
          {player.name}
        </div>
        <div className="health-bar-container">
          <div 
            className="health-bar" 
            style={{ 
              width: `${Math.max(0, healthPercentage)}%`,
              background: healthColor,
              transform: isPlayer2 ? 'scaleX(-1)' : 'none',
              transformOrigin: isPlayer2 ? 'right' : 'left'
            }}
          />
          <div className="health-text">
            {Math.max(0, Math.floor(player.health))} / {player.maxHealth}
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '0.3rem', 
          marginTop: '0.3rem',
          justifyContent: isPlayer2 ? 'flex-end' : 'flex-start'
        }}>
          {/* Round wins indicator */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                border: '1px solid #666',
                background: i < player.wins ? player.character?.colors?.primary || '#00ff41' : 'transparent',
                borderColor: player.character?.colors?.primary || '#00ff41'
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const formatTimer = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timer <= 10) return '#ff0000';
    if (timer <= 30) return '#ffff00';
    return '#ffffff';
  };

  return (
    <div className="game-hud">
      {/* Player 1 HUD */}
      {renderHealthBar(player1, false)}

      {/* Center Info */}
      <div className="round-counter">
        <div className="round-info">
          ROUND {round}
        </div>
        <div 
          className="round-timer" 
          style={{ 
            color: getTimerColor(),
            animation: timer <= 10 ? 'blink 0.5s infinite' : 'none'
          }}
        >
          {formatTimer(timer)}
        </div>
        {winner && (
          <div style={{ 
            fontSize: '0.6rem', 
            color: '#00ff41', 
            marginTop: '0.5rem',
            animation: 'glow 1s ease-in-out infinite alternate'
          }}>
            GAME OVER
          </div>
        )}
        {roundWinner && !winner && (
          <div style={{ 
            fontSize: '0.5rem', 
            color: '#ff6b35', 
            marginTop: '0.5rem'
          }}>
            {roundWinner} WINS ROUND!
          </div>
        )}
      </div>

      {/* Player 2 HUD */}
      {renderHealthBar(player2, true)}

      {/* Special Move Indicators (if characters have special energy) */}
      {(player1.character?.specialEnergy !== undefined || player2.character?.specialEnergy !== undefined) && (
        <>
          {/* Player 1 Special Bar */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '2rem',
            width: '200px',
            height: '8px',
            background: '#333',
            border: '1px solid #666'
          }}>
            <div style={{
              width: `${(player1.character?.specialEnergy || 0)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff6b35, #f7931e)',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Player 2 Special Bar */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '2rem',
            width: '200px',
            height: '8px',
            background: '#333',
            border: '1px solid #666'
          }}>
            <div style={{
              width: `${(player2.character?.specialEnergy || 0)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff6b35, #f7931e)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </>
      )}

      {/* Combo Counter */}
      {(player1.combo > 1 || player2.combo > 1) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '2rem',
          color: '#ff6b35',
          textShadow: '2px 2px 0px #000',
          animation: 'pulse 0.2s ease-in-out',
          pointerEvents: 'none'
        }}>
          {player1.combo > 1 && `${player1.combo} HIT COMBO!`}
          {player2.combo > 1 && `${player2.combo} HIT COMBO!`}
        </div>
      )}

      {/* Fight Start Indicator */}
      {round === 1 && timer === 99 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '3rem',
          color: '#00ff41',
          textShadow: '3px 3px 0px #000',
          animation: 'fightStart 2s ease-out forwards',
          pointerEvents: 'none'
        }}>
          FIGHT!
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes fightStart {
          0% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.5); 
          }
          50% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.2); 
          }
          80% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
          }
          100% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(1); 
          }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default React.memo(GameHUD); 