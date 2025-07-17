import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GameHUD from '../UI/GameHUD'

// Импортируем звуковые файлы
import fightSound from '../../assets/fight_voice.m4a'
import deadlineSound from '../../assets/deadlineapproaches_voice.m4a'
import congratsSound from '../../assets/CongratsYouHired_voice.m4a'
import mentorLeftSound from '../../assets/MentorName_LeftTheProject_voice.m4a'
import ciFailedSound from '../../assets/CIFailed_voice.m4a'
import mergeConflictSound from '../../assets/MergeConflict_voice.m4a'

// Звуковой менеджер
const SoundManager = {
  sounds: {},
  
  init() {
    this.sounds = {
      fight: new Audio(fightSound),
      deadline: new Audio(deadlineSound),
      victory: new Audio(congratsSound),
      defeat: new Audio(mentorLeftSound),
      damage: new Audio(ciFailedSound),
      block: new Audio(mergeConflictSound)
    }
    
    // Настройка громкости
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0.7
    })
  },
  
  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].currentTime = 0
      this.sounds[soundName].play().catch(e => console.log('Sound play failed:', e))
    }
  }
}

// Используем все доступные арены mk.js
const ARENAS = [
  { id: 'TOWER', name: 'Tower' },
  { id: 'THRONE_ROOM', name: 'Throne Room' },
  { id: 'PODCAST_ARENA', name: 'Podcast Studio' },
  { id: 'DEMODAY_ARENA', name: 'Demo Day Hall' }
]

export default function GameCanvas({ gameState }) {
  const navigate = useNavigate()
  const gameContainerRef = useRef(null)
  const [isGameLoaded, setIsGameLoaded] = useState(false)
  const [loadingError, setLoadingError] = useState(null)
  const gameInitRef = useRef(false)
  const [currentArena, setCurrentArena] = useState(null)
  const [showControls, setShowControls] = useState(false) // Для показа/скрытия подробного управления
  const [players, setPlayers] = useState({
    player1: { name: gameState.player1Character?.displayName || 'Player 1', life: 100 },
    player2: { name: gameState.player2Character?.displayName || 'Player 2', life: 100 }
  })

  // Инициализация звукового менеджера
  useEffect(() => {
    SoundManager.init()
  }, [])

  // Простая функция случайного выбора арены
  const getRandomArena = () => {
    const randomIndex = Math.floor(Math.random() * ARENAS.length)
    const arena = ARENAS[randomIndex]
    console.log(`🎲 Random arena selected: ${arena.name} (${arena.id})`)
    return arena
  }

  // Функция для обновления здоровья игроков
  const updatePlayerHealth = (fighterName, health) => {
    console.log(`🩺 Health update: ${fighterName} -> ${health}%`)
    
    setPlayers(prev => {
      if (fighterName.toLowerCase().includes('subzero') || fighterName.toLowerCase().includes('bakhredin')) {
        return {
          ...prev,
          player1: { ...prev.player1, life: Math.max(0, Math.min(100, health)) }
        }
      } else if (fighterName.toLowerCase().includes('kano') || fighterName.toLowerCase().includes('diana')) {
        return {
          ...prev,
          player2: { ...prev.player2, life: Math.max(0, Math.min(100, health)) }
        }
      } else if (fighterName.toLowerCase().includes('scorpion')) {
        // Определяем какой игрок играет за Scorpion
        if (gameState.player1Character?.name === 'scorpion') {
          return {
            ...prev,
            player1: { ...prev.player1, life: Math.max(0, Math.min(100, health)) }
          }
        } else if (gameState.player2Character?.name === 'scorpion') {
          return {
            ...prev,
            player2: { ...prev.player2, life: Math.max(0, Math.min(100, health)) }
          }
        }
      }
      return prev
    })
  }

  // Выбираем арену при инициализации или рестарте
  useEffect(() => {
    if (currentArena === null) {
      const newArena = getRandomArena()
      setCurrentArena(newArena)
    }
  }, [currentArena])

  useEffect(() => {
    // Предотвращаем множественную инициализацию
    if (gameInitRef.current || currentArena === null) {
      console.log('🚫 Game already initialized or arena not selected, skipping')
      return
    }

    gameInitRef.current = true
    console.log(`🎮 Starting fresh game initialization with arena: ${currentArena.name} (${currentArena.id})`)
    
    const initGame = async () => {
      try {
        // Полная очистка перед началом
        console.log('🧹 Pre-init cleanup')
        if (gameContainerRef.current) {
          gameContainerRef.current.innerHTML = ''
        }
        
        // Если mk уже существует, полностью его очищаем
        if (window.mk) {
          console.log('🗑️ Clearing existing mk.js instance')
          if (window.mk.game) {
            try {
              if (window.mk.game.stop) window.mk.game.stop()
            } catch (e) {
              console.warn('Could not stop existing game:', e)
            }
          }
          
          // Очищаем все интервалы, которые может создавать mk.js
          console.log('🕐 Clearing all intervals')
          for (let i = 1; i < 1000; i++) {
            window.clearInterval(i)
          }
          
          delete window.mk
        }

        // Загружаем скрипты если их нет
        if (typeof window.mk === 'undefined') {
          console.log('📦 Loading mk.js scripts...')
          
          await loadScript('/mk.js/game/src/movement.js')
          await loadScript('/mk.js/game/src/mk.js')

          // Ждем загрузки mk объекта
          let attempts = 0
          while (typeof window.mk === 'undefined' && attempts < 100) {
            attempts++
            await new Promise(resolve => setTimeout(resolve, 50))
          }

          if (typeof window.mk === 'undefined') {
            throw new Error('mk.js failed to load after 5 seconds')
          }
        }

        console.log('✅ mk.js is ready')
        
        // Настраиваем пути к изображениям
        if (window.mk && window.mk.config) {
          window.mk.config.IMAGES = '/mk.js/game/images/'
          // Увеличиваем время между кадрами анимации для стабильности
          window.mk.config.STEP_DURATION = 120 // было 80, делаем 120
          console.log('🖼️ Image paths configured:', window.mk.config.IMAGES)
          console.log('⏱️ Step duration set to:', window.mk.config.STEP_DURATION)
        }
        
        // Ждем готовности DOM
        await new Promise(resolve => setTimeout(resolve, 200))
        
        if (!gameContainerRef.current) {
          throw new Error('Game container not available')
        }

        console.log('🚀 Starting mk game...')
        
        // Фиксированный размер для стабильности
        const gameWidth = 1000
        const gameHeight = 500
        
        console.log(`🎯 Game size: ${gameWidth}x${gameHeight}`)
        console.log(`🏟️ Using arena: ${currentArena.name} (${currentArena.id})`)
        
        // Получаем правильную константу арены из mk.js
        const arenaType = window.mk.arenas.types[currentArena.id]
        console.log(`🎭 Arena type constant: ${arenaType}`)
        
        // Простые опции с выбранной ареной
        const options = {
          arena: {
            container: gameContainerRef.current,
            arena: arenaType, // Используем константу mk.js вместо числа
            width: gameWidth,
            height: gameHeight
          },
          fighters: [
            { name: 'Subzero' },
            { name: 'Kano' }
          ],
          gameType: 'multiplayer', // Изменено с 'basic' на 'multiplayer'
          callbacks: {
            // Callback когда игрок получает урон
            attack: function(attacker, victim, damage) {
              console.log(`⚔️ Attack: ${attacker.getName()} -> ${victim.getName()}, damage: ${damage}`)
              
              const victimLife = victim.getLife()
              console.log(`💚 ${victim.getName()} health: ${victimLife}`)
              
              // Воспроизводим звук урона
              SoundManager.play('damage')
              
              // Обновляем здоровье в UI
              updatePlayerHealth(victim.getName(), victimLife)
            },
            
            // Callback когда игрок умирает
            death: function(fighter) {
              console.log(`💀 ${fighter.getName()} died!`)
              updatePlayerHealth(fighter.getName(), 0)
            },
            
            // Callback когда бой заканчивается
            victory: function(winner) {
              console.log(`🏆 Victory: ${winner.getName()} wins!`)
            }
          }
        }

        console.log('🎮 Game options:', options)

        // Проверяем, что нет другой активной игры
        if (window.mk.game) {
          console.log('⚠️ Another game instance found, stopping it first')
          if (window.mk.reset) {
            window.mk.reset()
          }
        }

        const gamePromise = window.mk.start(options)
        console.log('📋 Game promise created:', typeof gamePromise)
        
        // Устанавливаем ready callback
        if (gamePromise && gamePromise.ready) {
          console.log('✅ Setting up ready callback')
          gamePromise.ready(() => {
            console.log('🎉 Game ready!')
            setIsGameLoaded(true)
            
            // Воспроизводим звук начала боя
            setTimeout(() => {
              SoundManager.play('fight')
            }, 500)
            
            // Периодически проверяем здоровье игроков с меньшей частотой
            const healthCheckInterval = setInterval(() => {
              if (window.mk && window.mk.game && window.mk.game.fighters) {
                window.mk.game.fighters.forEach(fighter => {
                  if (fighter && fighter.getLife && fighter.getName) {
                    const currentLife = fighter.getLife()
                    updatePlayerHealth(fighter.getName(), currentLife)
                  }
                })
              }
            }, 200) // Увеличиваем до 200ms для стабильности
            
            // Сохраняем интервал для очистки
            window.mkHealthInterval = healthCheckInterval
          })
        } else {
          console.log('❌ No ready method on game promise')
        }

        // Фоллбэк через 3 секунды (увеличиваем время)
        setTimeout(() => {
          console.log('⏰ Force showing game after 3 seconds')
          setIsGameLoaded(true)
          
          // Проверяем содержимое контейнера
          if (gameContainerRef.current) {
            const children = gameContainerRef.current.children.length
            console.log(`📊 Container has ${children} children`)
            if (children === 0) {
              console.log('❌ Container is still empty - possible mk.js error')
            }
          }
        }, 3000)

      } catch (error) {
        console.error('❌ Game initialization error:', error)
        setLoadingError(error.message)
        gameInitRef.current = false
      }
    }

    initGame()

    // Cleanup функция
    return () => {
      console.log('🧹 Component cleanup')
      
      // Очищаем интервал проверки здоровья
      if (window.mkHealthInterval) {
        clearInterval(window.mkHealthInterval)
        window.mkHealthInterval = null
      }
      
      // Полная очистка mk.js состояния
      cleanupMkGame()
      
      gameInitRef.current = false
    }
  }, [currentArena]) // Зависимость от currentArena

  // Функция загрузки скрипта
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      // Удаляем существующий скрипт если он есть
      const existingScript = document.querySelector(`script[src*="${src.split('/').pop()}"]`)
      if (existingScript) {
        console.log('🗑️ Removing existing script:', src)
        existingScript.remove()
      }
      
      console.log('📥 Loading script:', src)
      const script = document.createElement('script')
      script.src = src + '?t=' + Date.now() // Добавляем timestamp для избежания кэширования
      script.onload = () => {
        console.log('✅ Script loaded:', src)
        resolve()
      }
      script.onerror = () => reject(new Error(`Failed to load ${src}`))
      document.head.appendChild(script)
    })
  }

  const handlePause = () => {
    console.log('Game paused')
  }

  const handleRestart = () => {
    console.log('🔄 Restarting game...')
    
    // Очищаем интервал при перезапуске
    if (window.mkHealthInterval) {
      clearInterval(window.mkHealthInterval)
      window.mkHealthInterval = null
    }
    
    // Полностью очищаем mk.js состояние
    cleanupMkGame()
    
    // Сбрасываем состояние компонента
    setIsGameLoaded(false)
    setLoadingError(null)
    gameInitRef.current = false
    setCurrentArena(null) // Это заставит выбрать новую арену
    
    // Сбрасываем здоровье
    setPlayers({
      player1: { name: 'Bakhredin', life: 100 },
      player2: { name: 'Diana', life: 100 }
    })
    
    console.log('🚀 Restarting game after cleanup')
  }

  const handleMainMenu = () => {
    console.log('🏠 Returning to main menu')
    
    // Очищаем интервал при выходе
    if (window.mkHealthInterval) {
      clearInterval(window.mkHealthInterval)
      window.mkHealthInterval = null
    }
    
    // Полностью очищаем mk.js состояние
    cleanupMkGame()
    
    navigate('/')
  }

  // Функция для полной очистки mk.js
  const cleanupMkGame = () => {
    console.log('🧹 Cleaning up mk.js state')
    
    try {
      // Очищаем контейнер
      if (gameContainerRef.current) {
        gameContainerRef.current.innerHTML = ''
      }
      
      // Останавливаем игру если она существует
      if (window.mk && window.mk.game) {
        console.log('⏹️ Stopping existing mk.js game')
        
        // Пытаемся остановить игру
        if (window.mk.game.stop) {
          window.mk.game.stop()
        }
        
        // Очищаем ссылки на игру
        window.mk.game = null
      }
      
      // Очищаем все интервалы mk.js
      console.log('🕐 Clearing all intervals (again)')
      for (let i = 1; i < 1000; i++) {
        window.clearInterval(i)
      }
      
      // Полностью сбрасываем mk объект для чистого старта
      if (window.mk) {
        console.log('🗑️ Resetting mk.js object')
        delete window.mk
      }
      
      // Удаляем скрипты mk.js из DOM
      const scripts = document.querySelectorAll('script[src*="mk.js"], script[src*="movement.js"]')
      scripts.forEach(script => {
        console.log('🗑️ Removing script:', script.src)
        script.remove()
      })
      
    } catch (error) {
      console.warn('⚠️ Error during cleanup:', error)
    }
  }

  const handleGameEnd = (result) => {
    console.log(`🏆 Game ended with result: ${result}`)
    
    // Можно добавить дополнительную логику при окончании игры
    // Например, сохранение статистики или показ дополнительной информации
    
    // Остановить игру если нужно
    if (window.mk && window.mk.game) {
      // mk.js может не иметь метода для остановки, но можно попробовать
      console.log('🛑 Attempting to pause/stop mk.js game')
    }
  }

  const getArenaName = (arena) => {
    return arena?.name || 'Unknown Arena'
  }

  if (loadingError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-red-900/50 p-8 rounded-lg border border-red-500 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Game Error</h2>
          <p className="text-gray-300 mb-6">{loadingError}</p>
          <div className="space-y-2">
            <button onClick={handleMainMenu} className="btn-primary w-full">
              Main Menu
            </button>
            <button onClick={handleRestart} className="btn-secondary w-full">
              Reload
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <GameHUD
        players={players}
        onPause={handlePause}
        onRestart={handleRestart}
        onMainMenu={handleMainMenu}
        onGameEnd={handleGameEnd}
      />

      <div className="flex justify-center items-center p-4 pt-20">
        <div className="relative">
          {!isGameLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-10 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="text-yellow-400 text-xl mt-4">Loading Fight...</p>
                <p className="text-gray-400 mt-2">Bakhredin vs Diana</p>
                {currentArena && (
                  <p className="text-gray-500 mt-1 text-sm">
                    Arena: {getArenaName(currentArena)}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div
            ref={gameContainerRef}
            className="border-4 border-yellow-400 rounded-lg overflow-hidden bg-black"
            style={{ 
              width: '1000px',
              height: '500px'
            }}
          />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-gray-600 bg-opacity-90 p-4 rounded-lg text-sm text-gray-300">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-yellow-400 font-bold">Controls:</h3>
          <button
            onClick={() => setShowControls(!showControls)}
            className="text-yellow-400 hover:text-yellow-300 text-xs"
          >
            {showControls ? '▼ Hide' : '▲ Show'}
          </button>
        </div>
        
        {showControls && (
          <div className="space-y-2">
            <div className="text-green-400 font-semibold">Player 1 (Bakhredin):</div>
            <div className="ml-2 space-y-1 text-xs">
              <div>🕹️ W/A/S/D - движение</div>
              <div>🛡️ Shift - блок</div>
              <div>👊 Q - сильный удар, E - слабый удар</div>
              <div>🦵 Z - слабый кик, X - сильный кик</div>
            </div>
            
            <div className="text-blue-400 font-semibold mt-2">Player 2 (Diana):</div>
            <div className="ml-2 space-y-1 text-xs">
              <div>🕹️ ↑/←/↓/→ - движение</div>
              <div>🛡️ / (слэш) - блок</div>
              <div>👊 O - сильный удар, P - слабый удар</div>
              <div>�� , (запятая) - слабый кик, . (точка) - сильный кик</div>
            </div>
          </div>
        )}
        
        {!showControls && (
          <div className="text-xs text-gray-400">
            P1: WASD+Q/E/Z/X • P2: Arrows+O/P/,/.
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 bg-gray-600 bg-opacity-90 p-4 rounded-lg text-sm text-gray-300">
        <h3 className="text-yellow-400 font-bold mb-2">Debug Info:</h3>
        <p>Game Loaded: {isGameLoaded ? '✅' : '⏳'}</p>
        <p>Initialized: {gameInitRef.current ? '✅' : '⏳'}</p>
        <p>Container children: {gameContainerRef.current?.children?.length || 0}</p>
        <p>mk available: {typeof window.mk !== 'undefined' ? '✅' : '❌'}</p>
        <p>P1 Health: {players.player1.life}%</p>
        <p>P2 Health: {players.player2.life}%</p>
        <p>Current Arena: {currentArena ? getArenaName(currentArena) : 'None'}</p>
      </div>
    </div>
  )
} 