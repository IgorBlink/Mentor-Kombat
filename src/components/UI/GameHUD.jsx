import { useState, useEffect } from 'react'

export default function GameHUD({ players, onPause, onRestart, onMainMenu }) {
  const [gameTime, setGameTime] = useState(90) // 90 секунд на раунд
  const [isRunning, setIsRunning] = useState(true)
  const [round, setRound] = useState(1)

  useEffect(() => {
    let interval = null
    if (isRunning && gameTime > 0) {
      interval = setInterval(() => {
        setGameTime(time => time - 1)
      }, 1000)
    } else if (gameTime === 0) {
      // Время вышло
      setIsRunning(false)
    }
    return () => clearInterval(interval)
  }, [isRunning, gameTime])

  const handlePauseToggle = () => {
    setIsRunning(!isRunning)
    onPause()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getHealthBarColor = (life) => {
    if (life > 60) return 'bg-green-500'
    if (life > 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="relative z-20">
      {/* Top HUD Bar */}
      <div className="bg-gray-900 bg-opacity-90 border-b-2 border-yellow-400 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Player 1 */}
          <div className="flex-1">
            <div className="text-left">
              <h3 className="text-lg font-bold text-yellow-400 mb-1">
                {players.player1.name}
              </h3>
              <div className="w-80 h-6 bg-gray-600 rounded-full border-2 border-yellow-400 overflow-hidden">
                <div 
                  className={`h-full ${getHealthBarColor(players.player1.life)} transition-all duration-300 ease-out rounded-full`}
                  style={{ width: `${players.player1.life}%` }}
                />
              </div>
              <div className="text-sm text-gray-300 mt-1">
                HP: {players.player1.life}/100
              </div>
            </div>
          </div>

          {/* Center - Timer and Round */}
          <div className="text-center mx-8">
            <div className="text-4xl font-bold text-red-500 mb-2">
              {formatTime(gameTime)}
            </div>
            <div className="text-lg text-yellow-400">
              ROUND {round}
            </div>
            {gameTime <= 10 && gameTime > 0 && (
              <div className="text-red-500 text-sm animate-pulse">
                TIME RUNNING OUT!
              </div>
            )}
            {gameTime === 0 && (
              <div className="text-red-500 text-lg font-bold animate-pulse">
                TIME UP!
              </div>
            )}
          </div>

          {/* Player 2 */}
          <div className="flex-1">
            <div className="text-right">
              <h3 className="text-lg font-bold text-yellow-400 mb-1">
                {players.player2.name}
              </h3>
              <div className="w-80 h-6 bg-gray-600 rounded-full border-2 border-yellow-400 overflow-hidden ml-auto">
                <div 
                  className={`h-full ${getHealthBarColor(players.player2.life)} transition-all duration-300 ease-out rounded-full ml-auto`}
                  style={{ width: `${players.player2.life}%` }}
                />
              </div>
              <div className="text-sm text-gray-300 mt-1">
                HP: {players.player2.life}/100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="absolute top-4 right-4">
        <div className="flex space-x-2">
          <button
            onClick={handlePauseToggle}
            className="bg-gray-600 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
            title={isRunning ? "Пауза" : "Продолжить"}
          >
            {isRunning ? "⏸️" : "▶️"}
          </button>
          
          <button
            onClick={onRestart}
            className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
            title="Перезапуск"
          >
            🔄
          </button>
          
          <button
            onClick={onMainMenu}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 p-2 rounded-lg transition-colors"
            title="Главное меню"
          >
            🏠
          </button>
        </div>
      </div>

      {/* Pause Overlay */}
      {!isRunning && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30">
          <div className="text-center">
            <h2 className="text-6xl font-bold text-yellow-400 animate-pulse mb-8">
              PAUSED
            </h2>
            <div className="space-y-4">
              <button
                onClick={handlePauseToggle}
                className="btn-primary text-xl px-8 py-3"
              >
                Продолжить
              </button>
              <br />
              <button
                onClick={onRestart}
                className="btn-secondary text-lg px-6 py-2"
              >
                Перезапуск
              </button>
              <br />
              <button
                onClick={onMainMenu}
                className="btn-secondary text-lg px-6 py-2"
              >
                Главное меню
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory/Defeat Overlay */}
      {(players.player1.life === 0 || players.player2.life === 0) && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-30">
          <div className="text-center">
            <h2 className="text-8xl font-bold text-yellow-400 animate-glow mb-4">
              {players.player1.life === 0 ? players.player2.name : players.player1.name}
            </h2>
            <h3 className="text-4xl font-bold text-red-500 mb-8">
              WINS!
            </h3>
            <div className="space-y-4">
              <button
                onClick={onRestart}
                className="btn-primary text-xl px-8 py-3"
              >
                Реванш
              </button>
              <br />
              <button
                onClick={onMainMenu}
                className="btn-secondary text-lg px-6 py-2"
              >
                Главное меню
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 