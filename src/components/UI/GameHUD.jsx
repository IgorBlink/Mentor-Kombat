import { useState, useEffect } from 'react'

// Импортируем звуковые файлы
import deadlineSound from '../../assets/deadlineapproaches_voice.m4a'
import congratsSound from '../../assets/CongratsYouHired_voice.m4a'
import mentorLeftSound from '../../assets/MentorName_LeftTheProject_voice.m4a'

// Звуковой менеджер для HUD
const HUDSoundManager = {
  sounds: {},
  
  init() {
    this.sounds = {
      deadline: new Audio(deadlineSound),
      victory: new Audio(congratsSound),
      defeat: new Audio(mentorLeftSound)
    }
    
    // Настройка громкости
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0.8
    })
  },
  
  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].currentTime = 0
      this.sounds[soundName].play().catch(e => console.log('HUD Sound play failed:', e))
    }
  }
}

export default function GameHUD({ players, onPause, onRestart, onMainMenu, onGameEnd }) {
  const [gameTime, setGameTime] = useState(90) // 90 секунд на раунд
  const [isRunning, setIsRunning] = useState(true)
  const [round, setRound] = useState(1)
  const [gameResult, setGameResult] = useState(null) // 'player1', 'player2', 'draw', или null
  const [deadlineSoundPlayed, setDeadlineSoundPlayed] = useState(false)

  // Инициализация звукового менеджера
  useEffect(() => {
    HUDSoundManager.init()
  }, [])

  useEffect(() => {
    let interval = null
    if (isRunning && gameTime > 0 && !gameResult) {
      interval = setInterval(() => {
        setGameTime(time => {
          // Воспроизводим звук критического времени при 10 секундах
          if (time === 10 && !deadlineSoundPlayed) {
            HUDSoundManager.play('deadline')
            setDeadlineSoundPlayed(true)
          }
          return time - 1
        })
      }, 1000)
    } else if (gameTime === 0 && !gameResult) {
      // Время вышло - определяем победителя по здоровью
      setIsRunning(false)
      determineWinnerByHealth()
    }
    return () => clearInterval(interval)
  }, [isRunning, gameTime, gameResult, players, deadlineSoundPlayed])

  // Отслеживаем изменения здоровья игроков для определения победы нокаутом
  useEffect(() => {
    if (!gameResult && gameTime > 0) {
      if (players.player1.life === 0 && players.player2.life === 0) {
        setGameResult('draw')
        setIsRunning(false)
        // Ничья - играем звук поражения
        HUDSoundManager.play('defeat')
        if (onGameEnd) onGameEnd('draw')
      } else if (players.player1.life === 0) {
        setGameResult('player2')
        setIsRunning(false)
        // Победа Player 2
        HUDSoundManager.play('victory')
        if (onGameEnd) onGameEnd('player2')
      } else if (players.player2.life === 0) {
        setGameResult('player1')
        setIsRunning(false)
        // Победа Player 1
        HUDSoundManager.play('victory')
        if (onGameEnd) onGameEnd('player1')
      }
    }
  }, [players.player1.life, players.player2.life, gameResult, gameTime, onGameEnd])

  const determineWinnerByHealth = () => {
    let winner
    if (players.player1.life > players.player2.life) {
      winner = 'player1'
      HUDSoundManager.play('victory')
    } else if (players.player2.life > players.player1.life) {
      winner = 'player2'
      HUDSoundManager.play('victory')
    } else {
      winner = 'draw'
      HUDSoundManager.play('defeat')
    }
    
    setGameResult(winner)
    if (onGameEnd) onGameEnd(winner)
  }

  const handlePauseToggle = () => {
    if (!gameResult) {
      setIsRunning(!isRunning)
      onPause()
    }
  }

  const handleRestart = () => {
    setGameTime(90)
    setIsRunning(true)
    setGameResult(null)
    setDeadlineSoundPlayed(false) // Сбрасываем флаг звука критического времени
    onRestart()
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

  const getWinnerName = () => {
    if (gameResult === 'player1') {
      // Показываем реальное имя из mk.js - Sub-Zero
      return 'SUB-ZERO'
    }
    if (gameResult === 'player2') {
      // Показываем реальное имя из mk.js - Kano  
      return 'KANO'
    }
    return 'DRAW'
  }

  const getWinType = () => {
    if (gameTime === 0 && gameResult !== null) {
      if (gameResult === 'draw') return 'TIME UP - DRAW!'
      return 'TIME UP - VICTORY!'
    }
    if (players.player1.life === 0 || players.player2.life === 0) {
      return 'KNOCKOUT!'
    }
    return 'WINS!'
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
            <div className={`text-4xl font-bold mb-2 ${gameTime <= 10 && gameTime > 0 ? 'text-red-500 animate-pulse' : 'text-red-500'}`}>
              {formatTime(gameTime)}
            </div>
            <div className="text-lg text-yellow-400">
              ROUND {round}
            </div>
            {gameTime <= 10 && gameTime > 0 && !gameResult && (
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
            disabled={gameResult !== null}
          >
            {isRunning ? "⏸️" : "▶️"}
          </button>
          
          <button
            onClick={handleRestart}
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
      {!isRunning && !gameResult && (
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
                onClick={handleRestart}
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
      {gameResult && (
        <div className="absolute inset-0 bg-black bg-opacity-95 flex items-center justify-center z-30">
          <div className="text-center victory-entrance">
            {gameResult === 'draw' ? (
              <>
                <h2 className="text-9xl font-bold text-yellow-400 animate-glow mb-6 tracking-wider">
                  DRAW
                </h2>
                <h3 className="text-5xl font-bold text-gray-400 mb-8 tracking-wide">
                  {getWinType()}
                </h3>
                <div className="text-3xl text-gray-300 mb-12">
                  Оба игрока показали равную силу!
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-8xl md:text-9xl font-bold text-red-500 animate-glow mb-4 tracking-wider drop-shadow-2xl">
                    {getWinnerName()}
                  </h2>
                  <div className="w-96 h-2 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 mx-auto rounded-full animate-pulse"></div>
                </div>
                
                <h3 className="text-5xl md:text-6xl font-bold text-yellow-400 mb-8 tracking-wide animate-pulse">
                  WINS!
                </h3>
                
                <div className="text-2xl md:text-3xl text-red-400 font-bold mb-8 tracking-wide">
                  {getWinType()}
                </div>
                
                {gameTime === 0 && (
                  <div className="text-xl md:text-2xl text-gray-300 mb-12 bg-gray-800 bg-opacity-50 p-4 rounded-lg border border-yellow-400">
                    Победа по количеству здоровья: {gameResult === 'player1' ? players.player1.life : players.player2.life} HP
                  </div>
                )}
              </>
            )}
            
            <div className="space-y-6 mt-8">
              <button
                onClick={handleRestart}
                className="btn-primary text-2xl px-12 py-4 transform hover:scale-110 transition-all duration-300 shadow-2xl"
              >
                🥊 РЕВАНШ
              </button>
              <br />
              <button
                onClick={onMainMenu}
                className="btn-secondary text-xl px-8 py-3 transform hover:scale-105 transition-all duration-300"
              >
                🏠 Главное меню
              </button>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-16 h-16 border-4 border-red-500 rotate-45 animate-spin opacity-30"></div>
            <div className="absolute bottom-10 right-10 w-12 h-12 border-4 border-yellow-400 rotate-45 animate-spin opacity-30"></div>
            <div className="absolute top-1/2 left-10 w-8 h-8 border-4 border-red-500 rotate-45 animate-pulse opacity-20"></div>
            <div className="absolute top-1/2 right-10 w-8 h-8 border-4 border-yellow-400 rotate-45 animate-pulse opacity-20"></div>
          </div>
        </div>
      )}
    </div>
  )
} 