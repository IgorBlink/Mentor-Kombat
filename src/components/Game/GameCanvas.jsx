import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import GameHUD from '../UI/GameHUD'

// Менеджер звуков для игры
const GameSoundManager = {
  sounds: {},
  
  init() {
    // Инициализация звуков
  },
  
  loadSound(name, path) {
    try {
      const audio = new Audio(path)
      audio.preload = 'auto'
      audio.volume = 0.7
      
      audio.addEventListener('canplaythrough', () => {
        console.log(`✅ Sound loaded: ${name}`)
      })
      
      audio.addEventListener('error', (e) => {
        console.warn(`⚠️ Failed to load sound ${name}:`, e)
      })
      
      this.sounds[name] = audio
    } catch (error) {
      console.warn(`⚠️ Failed to create audio for ${name}:`, error)
    }
  },
  
  play(soundName) {
    if (this.sounds[soundName]) {
      try {
        this.sounds[soundName].currentTime = 0
        this.sounds[soundName].play().catch(e => {
          console.warn(`Failed to play ${soundName}:`, e)
        })
      } catch (error) {
        console.warn(`Error playing ${soundName}:`, error)
      }
    }
  }
}

// Безопасная обёртка для DOM методов - предотвращает ошибки removeChild
const SafeDOM = {
  initialized: false,
  
  init() {
    if (this.initialized) return
    
    // Сохраняем оригинальные методы
    const originalRemoveChild = Node.prototype.removeChild
    const originalInsertBefore = Node.prototype.insertBefore
    
    // Переопределяем removeChild с безопасной проверкой
    Node.prototype.removeChild = function(child) {
      try {
        // Проверяем, действительно ли child является дочерним элементом
        if (this.contains(child)) {
          return originalRemoveChild.call(this, child)
        } else {
          console.warn('SafeDOM: Attempted to remove a child that is not a child of this node')
          return child
        }
      } catch (error) {
        console.warn('SafeDOM: Error in removeChild:', error)
        return child
      }
    }
    
    // Переопределяем insertBefore с безопасной проверкой
    Node.prototype.insertBefore = function(newNode, referenceNode) {
      try {
        if (referenceNode && !this.contains(referenceNode)) {
          console.warn('SafeDOM: Reference node is not a child of this node, appending instead')
          return this.appendChild(newNode)
        }
        return originalInsertBefore.call(this, newNode, referenceNode)
      } catch (error) {
        console.warn('SafeDOM: Error in insertBefore:', error)
        return this.appendChild(newNode)
      }
    }
    
    this.initialized = true
    console.log('🛡️ SafeDOM protection initialized')
  },
  
  cleanup() {
    // В реальном приложении здесь можно было бы восстановить оригинальные методы
    // Но это может повлиять на другие части приложения
  }
}

export default function GameCanvas({ gameState }) {
  const navigate = useNavigate()
  const gameContainerRef = useRef(null)
  const mkGameRef = useRef(null)
  const gameInitializedRef = useRef(false)
  const cleanupRef = useRef(false) // Флаг для предотвращения множественной очистки
  const eventListenersRef = useRef([]) // Хранение обработчиков событий
  
  const [debugLog, setDebugLog] = useState([])
  const [gameStatus, setGameStatus] = useState('loading')

  // Список арен
  const arenas = [
    { id: 0, name: 'Tower', type: 'TOWER' },
    { id: 1, name: 'Throne Room', type: 'THRONE_ROOM' },
    { id: 2, name: 'Podcast Arena', type: 'PODCAST_ARENA' },
    { id: 3, name: 'Demo Day Arena', type: 'DEMODAY_ARENA' }
  ]

  const getRandomArena = () => {
    const randomIndex = Math.floor(Math.random() * arenas.length)
    return arenas[randomIndex]
  }

  // Функция для добавления логов
  const addLog = useCallback((message) => {
    if (cleanupRef.current) return // Не логируем после очистки
    console.log(message)
    setDebugLog(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${message}`])
  }, [])

  // Функция для обновления здоровья игроков
  const updatePlayerHealth = (fighterName, health) => {
    if (cleanupRef.current) return // Не обновляем после очистки
    
    console.log(`🩺 Health update: ${fighterName} -> ${health}%`)
    
    setPlayers(prev => {
      // Определяем игрока по позиции в массиве бойцов, а не по имени
      const player1Character = gameState.player1Character?.name?.toLowerCase() || 'subzero'
      const player2Character = gameState.player2Character?.name?.toLowerCase() || 'kano'
      
      // Проверяем соответствие имени бойца выбранным персонажам
      if (fighterName.toLowerCase().includes(player1Character)) {
        return {
          ...prev,
          player1: { ...prev.player1, life: Math.max(0, Math.min(100, health)) }
        }
      } else if (fighterName.toLowerCase().includes(player2Character)) {
        return {
          ...prev,
          player2: { ...prev.player2, life: Math.max(0, Math.min(100, health)) }
        }
      }
      
      // Fallback: определяем по позиции (первый vs второй боец)
      if (fighterName.toLowerCase().includes('subzero') || fighterName.toLowerCase().includes('scorpion')) {
        // Если это известный персонаж, проверяем кто где играет
        if (gameState.player1Character?.name?.toLowerCase() === fighterName.toLowerCase()) {
          return {
            ...prev,
            player1: { ...prev.player1, life: Math.max(0, Math.min(100, health)) }
          }
        } else {
          return {
            ...prev,
            player2: { ...prev.player2, life: Math.max(0, Math.min(100, health)) }
          }
        }
      }
      
      return prev
    })
  }

  const [players, setPlayers] = useState({
    player1: { name: gameState.player1Character?.displayName || 'Player 1', life: 100 },
    player2: { name: gameState.player2Character?.displayName || 'Player 2', life: 100 }
  })

  // Функция для безопасного удаления обработчиков событий
  const removeEventListeners = useCallback(() => {
    eventListenersRef.current.forEach(({ target, type, handler }) => {
      try {
        target.removeEventListener(type, handler)
      } catch (error) {
        console.warn('Error removing event listener:', error)
      }
    })
    eventListenersRef.current = []
  }, [])

  // Функция для добавления обработчика событий с отслеживанием
  const addEventListenerWithTracking = useCallback((target, type, handler) => {
    target.addEventListener(type, handler)
    eventListenersRef.current.push({ target, type, handler })
  }, [])

  // Инициализация игры
  useEffect(() => {
    // Инициализируем защиту DOM
    SafeDOM.init()
    
    const initGame = async () => {
      if (gameInitializedRef.current || cleanupRef.current) {
        return
      }

      addLog('🎮 Initializing Mortal Kombat game...')
      setGameStatus('loading')

      try {
        // Ждем загрузки скриптов
        await loadScript('/mk.js/game/src/movement.js')
        await loadScript('/mk.js/game/src/mk.js')

        if (!window.mk) {
          throw new Error('mk.js not loaded')
        }

        addLog('✅ Scripts loaded successfully')

        // Настройка путей изображений
        if (window.mk.config) {
          window.mk.config.IMAGES = '/mk.js/game/images/'
          addLog('🖼️ Image paths configured')
        }

        // Проверяем контейнер
        if (!gameContainerRef.current) {
          throw new Error('Game container not found')
        }

        // Очищаем контейнер перед инициализацией
        gameContainerRef.current.innerHTML = ''

        const selectedArena = gameState.selectedArena || getRandomArena()
        addLog(`🏛️ Arena: ${selectedArena.name}`)

        // Настройка опций игры
        const gameOptions = {
          arena: {
            container: gameContainerRef.current,
            arena: window.mk.arenas.types[selectedArena.type] || window.mk.arenas.types.THRONE_ROOM,
            width: 800,
            height: 400
          },
          fighters: [
            { name: gameState.player1Character?.name || 'Subzero' },
            { name: gameState.player2Character?.name || 'Kano' }
          ],
          gameType: 'multiplayer',
          callbacks: {
            'attack': (attacker, defender, damage) => {
              if (cleanupRef.current) return
              addLog(`⚔️ Attack: ${attacker.getName()} -> ${defender.getName()} (${damage} dmg)`)
              updatePlayerHealth(defender.getName(), defender.getLife())
            },
            'game-end': (deadFighter) => {
              if (cleanupRef.current) return
              handleGameEnd({
                winnerName: deadFighter === mkGameRef.current.fighters[0] ? 
                  gameState.player2Character?.displayName || 'Player 2' : 
                  gameState.player1Character?.displayName || 'Player 1',
                loserName: deadFighter === mkGameRef.current.fighters[0] ? 
                  gameState.player1Character?.displayName || 'Player 1' : 
                  gameState.player2Character?.displayName || 'Player 2',
                method: 'Knockout'
              })
            }
          }
        }

        addLog('🚀 Starting mk.js...')
        const gamePromise = window.mk.start(gameOptions)

        if (!gamePromise) {
          throw new Error('Failed to start mk.js - no promise returned')
        }

        if (typeof gamePromise.ready === 'function') {
          gamePromise.ready(() => {
            if (cleanupRef.current) return
            
            addLog('🎉 Game ready!')
            mkGameRef.current = window.mk.game
            gameInitializedRef.current = true
            setGameStatus('playing')

            // Добавляем обработчики клавиатуры с отслеживанием
            const handleKeyDown = (e) => {
              if (cleanupRef.current) return
              // Обработка нажатий клавиш
            }
            
            const handleKeyUp = (e) => {
              if (cleanupRef.current) return
              // Обработка отпускания клавиш
            }

            addEventListenerWithTracking(document, 'keydown', handleKeyDown)
            addEventListenerWithTracking(document, 'keyup', handleKeyUp)
          })
        } else {
          // Fallback без ready callback
          setTimeout(() => {
            if (cleanupRef.current) return
            
            addLog('⚠️ No ready callback - using timeout fallback')
            mkGameRef.current = window.mk.game
            gameInitializedRef.current = true
            setGameStatus('playing')
          }, 2000)
        }

        // Принудительная проверка через 3 секунды
        setTimeout(() => {
          if (cleanupRef.current) return
          
          addLog('⏰ Force checking game state after 3 seconds')
          if (gameContainerRef.current) {
            const childCount = gameContainerRef.current.children.length
            addLog(`📊 Container has ${childCount} children`)
            
            if (childCount === 0 && !gameInitializedRef.current) {
              addLog('❌ Container is still empty - mk.js initialization failed')
              addLog('🔧 Trying to debug the issue...')
              addLog(`🔍 mk.game exists: ${!!window.mk?.game}`)
              addLog('🔄 Attempting restart with basic settings...')
              
              // Fallback инициализация
              setGameStatus('error')
              setTimeout(() => {
                if (!cleanupRef.current) {
                  initFallbackGame()
                }
              }, 1000)
            }
          }
        }, 3000)

      } catch (error) {
        if (cleanupRef.current) return
        
        console.error('Game initialization error:', error)
        addLog(`❌ Initialization failed: ${error.message}`)
        setGameStatus('error')
        
        // Попытка fallback инициализации
        setTimeout(() => {
          if (!cleanupRef.current) {
            initFallbackGame()
          }
        }, 1000)
      }
    }

    initGame()

    // Отправляем событие о готовности игры
    setTimeout(() => {
      if (cleanupRef.current) return
      const initEvent = new CustomEvent('game-canvas-init', { 
        detail: { 
          gameState, 
          container: gameContainerRef.current,
          arena: gameState.selectedArena || getRandomArena()
        } 
      })
      window.dispatchEvent(initEvent)
    }, 500)
  }, [gameState, addLog, addEventListenerWithTracking])

  const initFallbackGame = async () => {
    if (gameInitializedRef.current || cleanupRef.current) {
      return
    }

    addLog('🔄 Initializing fallback game...')
    
    try {
      if (!gameContainerRef.current) {
        throw new Error('No game container')
      }

      // Простая fallback игра
      gameContainerRef.current.innerHTML = `
        <div style="
          width: 800px; 
          height: 400px; 
          background: linear-gradient(135deg, #1a1a2e, #16213e);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: monospace;
          border: 2px solid #fbbf24;
          position: relative;
        ">
          <div style="text-align: center;">
            <h2 style="color: #fbbf24; margin-bottom: 20px;">⚔️ MORTAL KOMBAT ⚔️</h2>
            <p style="margin-bottom: 10px;">${gameState.player1Character?.displayName || 'Player 1'} vs ${gameState.player2Character?.displayName || 'Player 2'}</p>
            <p style="margin-bottom: 10px;">Arena: ${(gameState.selectedArena || getRandomArena()).name}</p>
            <p style="color: #888; font-size: 14px;">Fallback mode - Use controls to fight!</p>
          </div>
        </div>
      `
      
      gameInitializedRef.current = true
      setGameStatus('playing')
      addLog('✅ Fallback game initialized')
      
    } catch (error) {
      addLog(`❌ Fallback initialization failed: ${error.message}`)
      setGameStatus('error')
    }
  }

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      // Проверяем, не загружен ли скрипт уже
      const existingScript = document.querySelector(`script[src="${src}"]`)
      if (existingScript) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = () => {
        addLog(`✅ Script loaded: ${src}`)
        resolve()
      }
      script.onerror = () => {
        addLog(`❌ Failed to load script: ${src}`)
        reject(new Error(`Failed to load script: ${src}`))
      }
      document.head.appendChild(script)
    })
  }

  const handlePause = () => {
    addLog('⏸️ Game paused')
  }

  const handleRestart = () => {
    addLog('🔄 Restarting game...')
    
    // Сначала очищаем
    cleanupMkGame()
    
    // Затем перезагружаем страницу для полного сброса
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const handleMainMenu = () => {
    addLog('🏠 Returning to main menu')
    
    // Очистка игры
    cleanupMkGame()
    
    // Навигация в главное меню
    navigate('/')
  }

  const cleanupMkGame = useCallback(() => {
    if (cleanupRef.current) return // Предотвращаем множественную очистку
    
    cleanupRef.current = true
    addLog('🧹 Cleaning up mk.js game')
    
    try {
      // Останавливаем все звуки
      Object.values(GameSoundManager.sounds).forEach(audio => {
        try {
          audio.pause()
          audio.currentTime = 0
        } catch (e) {}
      })

      // Удаляем обработчики событий
      removeEventListeners()
      
      // Очистка mk.js
      if (window.mk && typeof window.mk.reset === 'function' && mkGameRef.current) {
        try {
          window.mk.reset()
          addLog('✅ mk.js reset completed')
        } catch (error) {
          addLog(`⚠️ mk.js cleanup error: ${error.message}`)
        }
      }
      
      // Очистка DOM контейнера
      if (gameContainerRef.current) {
        try {
          // Безопасная очистка содержимого
          while (gameContainerRef.current.firstChild) {
            gameContainerRef.current.removeChild(gameContainerRef.current.firstChild)
          }
        } catch (error) {
          // Fallback очистка
          try {
            gameContainerRef.current.innerHTML = ''
          } catch (e) {
            console.warn('Could not clear container:', e)
          }
        }
      }
      
      // Очистка референсов
      mkGameRef.current = null
      gameInitializedRef.current = false
      
      addLog('🧹 Cleanup completed')
    } catch (error) {
      console.error('Cleanup error:', error)
      addLog(`❌ Cleanup error: ${error.message}`)
    }
  }, [addLog, removeEventListeners])

  // Очистка при размонтировании компонента
  useEffect(() => {
    return () => {
      addLog('🔚 Component unmounting - cleaning up')
      cleanupMkGame()
    }
  }, [cleanupMkGame, addLog])

  const handleGameEnd = (result) => {
    if (cleanupRef.current) return
    
    addLog(`🏁 Game ended: ${result.winnerName} победил ${result.loserName}`)
    
    GameSoundManager.play('victory_voice')
    
    // Показываем результат
    setTimeout(() => {
      if (!cleanupRef.current) {
        alert(`🎉 ${result.winnerName} wins!\n\nMethod: ${result.method}`)
      }
    }, 1000)
  }

  const getArenaName = (arena) => {
    if (!arena) return 'Unknown Arena'
    return arena.name || arena.id || 'Unknown Arena'
  }

  // Слушаем событие перезапуска
  useEffect(() => {
    const handleRestartEvent = () => {
      if (cleanupRef.current) return
      
      if (gameContainerRef.current && !gameInitializedRef.current) {
        // Повторяем инициализацию
        setTimeout(() => {
          if (!cleanupRef.current) {
            window.location.reload() // Простой способ - перезагрузка страницы
          }
        }, 100)
      }
    }

    addEventListenerWithTracking(window, 'restart-game', handleRestartEvent)
  }, [addEventListenerWithTracking])

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Game HUD */}
      <GameHUD
        players={players}
        onPause={handlePause}
        onRestart={handleRestart}
        onMainMenu={handleMainMenu}
        onGameEnd={handleGameEnd}
      />

      {/* Game Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative">
          {/* Game Canvas Container */}
          <div
            ref={gameContainerRef}
            className="game-container border-2 border-yellow-400 shadow-2xl"
            style={{
              width: '800px',
              height: '400px',
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              position: 'relative'
            }}
          >
            {/* Loading State */}
            {gameStatus === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                <div className="text-center">
                  <div className="loading-spinner w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-yellow-400 font-mono">Loading Mortal Kombat...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {gameStatus === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-75">
                <div className="text-center">
                  <p className="text-red-400 font-mono mb-4">❌ Game Failed to Load</p>
                  <button
                    onClick={handleRestart}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls Info */}
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>Player 1: WASD + Q/E/Z/X + Shift | Player 2: Arrows + O/P/,/. + /</p>
          </div>
        </div>
      </div>

      {/* Debug Panel (только в development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info bg-gray-800 p-4 max-h-32 overflow-y-auto">
          <h4 className="text-yellow-400 mb-2">Debug Log:</h4>
          <div className="text-xs font-mono space-y-1">
            {debugLog.slice(-10).map((log, index) => (
              <div key={index} className="text-green-400">{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 