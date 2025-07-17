import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GameHUD from '../UI/GameHUD'

let gameInitialized = false // Глобальная переменная для предотвращения двойной инициализации

export default function GameCanvas({ gameState }) {
  const navigate = useNavigate()
  const gameContainerRef = useRef(null)
  const [isGameLoaded, setIsGameLoaded] = useState(false)
  const [loadingError, setLoadingError] = useState(null)
  const [players, setPlayers] = useState({
    player1: { name: 'Bakhredin', life: 100 },
    player2: { name: 'Diana', life: 100 }
  })

  useEffect(() => {
    if (gameInitialized) {
      console.log('Game already initialized, skipping...')
      return
    }
    
    console.log('=== STARTING GAME INITIALIZATION ===')
    gameInitialized = true

    const initGame = async () => {
      try {
        console.log('1. Checking container...', gameContainerRef.current)
        
        if (!gameContainerRef.current) {
          console.error('No container found!')
          return
        }

        // Ждем немного чтобы DOM был готов
        await new Promise(resolve => setTimeout(resolve, 100))

        console.log('2. Loading mk.js scripts...')
        
        // Простая загрузка скриптов
        const loadScript = (src) => {
          return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
              console.log(`Script ${src} already loaded`)
              resolve()
              return
            }
            
            const script = document.createElement('script')
            script.src = src
            script.onload = () => {
              console.log(`✅ Script loaded: ${src}`)
              resolve()
            }
            script.onerror = () => {
              console.error(`❌ Failed to load: ${src}`)
              reject(new Error(`Failed to load ${src}`))
            }
            document.head.appendChild(script)
          })
        }

        await loadScript('/mk.js/game/src/movement.js')
        await loadScript('/mk.js/game/src/mk.js')

        console.log('3. Scripts loaded, waiting for mk object...')

        // Ждем mk объект
        let attempts = 0
        while (typeof window.mk === 'undefined' && attempts < 50) {
          attempts++
          console.log(`Waiting for mk... attempt ${attempts}`)
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (typeof window.mk === 'undefined') {
          throw new Error('mk.js did not load properly')
        }

        console.log('4. mk.js loaded successfully:', window.mk)
        console.log('Available arena types:', window.mk.arenas.types)
        console.log('Available fighters:', window.mk.fighters)

        // Запускаем игру
        startGame()

      } catch (error) {
        console.error('❌ Init error:', error)
        setLoadingError(error.message)
      }
    }

    const startGame = () => {
      try {
        console.log('5. Starting game...')
        console.log('Container ready:', gameContainerRef.current)
        
        // Очищаем контейнер
        gameContainerRef.current.innerHTML = ''

        const options = {
          arena: {
            container: gameContainerRef.current,
            arena: window.mk.arenas.types.THRONE_ROOM
          },
          fighters: [
            { name: 'Subzero' },
            { name: 'Kano' }
          ],
          callbacks: {
            attack: function (attacker, defender) {
              console.log('🥊 Attack:', attacker.getName(), '->', defender.getName(), 'HP:', defender.getLife())
              updateLife(defender)
            }
          }
        }

        console.log('6. Game options:', options)
        console.log('7. Calling mk.start()...')

        const gamePromise = window.mk.start(options)
        console.log('8. mk.start() returned:', gamePromise)

        if (!gamePromise || typeof gamePromise.ready !== 'function') {
          throw new Error('Invalid game promise returned from mk.start()')
        }

        console.log('9. Setting up ready callback...')
        
        let readyCallbackCalled = false
        
        gamePromise.ready(() => {
          console.log('🎮 GAME IS READY!')
          readyCallbackCalled = true
          setIsGameLoaded(true)
        })

        // Добавляем несколько проверок
        setTimeout(() => {
          console.log('⏰ 2 seconds check - container content:', gameContainerRef.current?.innerHTML?.length > 0 ? 'HAS CONTENT' : 'EMPTY')
          console.log('Container children:', gameContainerRef.current?.children?.length || 0)
          
          // Если есть контент в контейнере, но ready не вызвался - принудительно показываем
          if (gameContainerRef.current?.children?.length > 0 && !readyCallbackCalled) {
            console.log('🔧 Container has content but ready not called - forcing display')
            setIsGameLoaded(true)
          }
        }, 2000)

        // Более агрессивная проверка через 3 секунды
        setTimeout(() => {
          console.log('⏰ 3 seconds check - ready called:', readyCallbackCalled)
          console.log('Container HTML:', gameContainerRef.current?.innerHTML?.substring(0, 200))
          
          if (!readyCallbackCalled) {
            // Проверяем есть ли canvas или другие элементы игры
            const hasCanvas = gameContainerRef.current?.querySelector('canvas')
            const hasGameElements = gameContainerRef.current?.children?.length > 0
            
            if (hasCanvas || hasGameElements) {
              console.log('🔧 Game elements found, forcing display')
              setIsGameLoaded(true)
            } else {
              console.log('🔄 No game elements, trying alternative initialization...')
              tryAlternativeInit()
            }
          }
        }, 3000)

        // Последняя попытка через 5 секунд
        setTimeout(() => {
          if (!isGameLoaded && !readyCallbackCalled) {
            console.warn('⚠️ Game ready callback not called within 5 seconds')
            console.log('Final container state:', gameContainerRef.current?.innerHTML?.substring(0, 200))
            // Показываем игру в любом случае
            setIsGameLoaded(true)
          }
        }, 5000)

        console.log('10. Setup complete, waiting for ready callback...')

      } catch (error) {
        console.error('❌ Game start error:', error)
        setLoadingError(error.message)
      }
    }

    const tryAlternativeInit = () => {
      console.log('🔄 Trying alternative initialization...')
      
      try {
        // Пробуем более простые опции
        const simpleOptions = {
          arena: {
            container: gameContainerRef.current,
            arena: window.mk.arenas.types.THRONE_ROOM
          },
          fighters: [
            { name: 'Subzero' },
            { name: 'Kano' }
          ]
        }
        
        console.log('Alternative options:', simpleOptions)
        
        const altGame = window.mk.start(simpleOptions)
        console.log('Alternative game:', altGame)
        
        if (altGame) {
          // Не ждем ready, просто показываем через секунду
          setTimeout(() => {
            console.log('🔧 Alternative init complete, showing game')
            setIsGameLoaded(true)
          }, 1000)
        }
        
      } catch (altError) {
        console.error('Alternative init failed:', altError)
        setIsGameLoaded(true) // Показываем в любом случае
      }
    }

    const updateLife = (fighter) => {
      const name = fighter.getName().toLowerCase()
      const life = Math.max(0, Math.round(fighter.getLife()))
      
      console.log('💓 Updating life:', name, life)
      
      setPlayers(prev => {
        const newPlayers = { ...prev }
        if (name.includes('subzero')) {
          newPlayers.player1.life = life
        } else if (name.includes('kano')) {
          newPlayers.player2.life = life
        }
        return newPlayers
      })
    }

    initGame()

    return () => {
      console.log('GameCanvas cleanup')
    }
  }, [])

  const handlePause = () => {
    console.log('Game paused')
  }

  const handleRestart = () => {
    gameInitialized = false
    window.location.reload()
  }

  const handleMainMenu = () => {
    gameInitialized = false
    navigate('/')
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
      />

      <div className="flex justify-center items-center p-4">
        <div className="relative">
          {!isGameLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="text-yellow-400 text-xl mt-4">Loading Fight...</p>
                <p className="text-gray-400 mt-2">Bakhredin vs Diana</p>
                <p className="text-gray-500 text-sm mt-2">Check console for details</p>
              </div>
            </div>
          )}
          
          <div
            ref={gameContainerRef}
            className="border-4 border-yellow-400 rounded-lg overflow-hidden bg-black"
            style={{ width: '800px', height: '400px' }}
          />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-gray-600 bg-opacity-90 p-4 rounded-lg text-sm text-gray-300">
        <h3 className="text-yellow-400 font-bold mb-2">Controls:</h3>
        <p>P1: A/D move, W jump, S crouch, J/K attack</p>
        <p>P2: ←/→ move, ↑ jump, ↓ crouch, 1/2 attack</p>
        <p className="mt-2 text-xs text-gray-400">SPACE to restart</p>
      </div>

      <div className="absolute bottom-4 right-4 bg-gray-600 bg-opacity-90 p-4 rounded-lg text-sm text-gray-300">
        <h3 className="text-yellow-400 font-bold mb-2">Debug Info:</h3>
        <p>Game Loaded: {isGameLoaded ? '✅' : '⏳'}</p>
        <p>P1 Life: {players.player1.life}</p>
        <p>P2 Life: {players.player2.life}</p>
        <p className="text-xs mt-1">Container children: {gameContainerRef.current?.children?.length || 0}</p>
      </div>
    </div>
  )
} 