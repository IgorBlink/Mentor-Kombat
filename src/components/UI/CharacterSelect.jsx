import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Импортируем иконки из menu_icons для сетки выбора
import bakhredinIcon from '../../assets/menu_icons/backhredin.png'
import dianaIcon from '../../assets/menu_icons/diana.png'
import scorpionIcon from '../../assets/menu_icons/scorpion.png'

// Импортируем звуковые файлы
import codeNowSound from '../../assets/codenow_voice.m4a'
import demoDaySound from '../../assets/DemoDay_voice.m4a'

// Звуковой менеджер для выбора персонажей
const CharacterSoundManager = {
  sounds: {},
  
  init() {
    this.sounds = {
      select: new Audio(codeNowSound),
      confirm: new Audio(demoDaySound)
    }
    
    // Настройка громкости
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0.7
    })
  },
  
  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].currentTime = 0
      this.sounds[soundName].play().catch(e => console.log('Character Sound play failed:', e))
    }
  }
}

const CHARACTERS = [
  {
    id: 'subzero',
    name: 'subzero',
    displayName: 'Bakhredin',
    // Для сетки - иконка из menu_icons
    portrait: bakhredinIcon,
    // Для боковых панелей - спрайт бойца
    fullBody: '/mk.js/game/images/fighters/subzero/left/stand/0.png',
    selected: false
  },
  {
    id: 'kano',
    name: 'kano',
    displayName: 'Diana',
    // Для Diana используем её уникальную иконку
    portrait: dianaIcon,
    // Для боковых панелей - спрайт бойца
    fullBody: '/mk.js/game/images/fighters/kano/left/stand/0.png',
    selected: false
  },
  {
    id: 'scorpion',
    name: 'scorpion',
    displayName: 'Scorpion',
    // Для Scorpion используем его спрайт как иконку
    portrait: scorpionIcon,
    // Для боковых панелей - спрайт бойца
    fullBody: '/mk.js/game/images/fighters/scorpion/left/stand/0.png',
    selected: false
  },
  // Заглушки для полной сетки 5x3
  { id: 'empty1', empty: true },
  { id: 'empty2', empty: true },
  { id: 'empty3', empty: true },
  { id: 'empty4', empty: true },
  { id: 'empty5', empty: true },
  { id: 'empty6', empty: true },
  { id: 'empty7', empty: true },
  { id: 'empty8', empty: true },
  { id: 'empty9', empty: true },
  { id: 'empty10', empty: true },
  { id: 'empty11', empty: true },
  { id: 'empty12', empty: true },
  { id: 'empty13', empty: true }
]

export default function CharacterSelect({ gameState, setGameState }) {
  const navigate = useNavigate()
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [hoveredCharacter, setHoveredCharacter] = useState(null)
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [showPreparation, setShowPreparation] = useState(false)
  const [countdown, setCountdown] = useState(3)

  // Инициализация звукового менеджера
  useEffect(() => {
    CharacterSoundManager.init()
  }, [])

  const handleCharacterSelect = (character) => {
    if (character.empty) return
    
    // Воспроизводим звук выбора
    CharacterSoundManager.play('select')
    
    setSelectedCharacter(character)
    
    setTimeout(() => {
      if (currentPlayer === 1) {
        setGameState(prev => ({ ...prev, player1Character: character }))
        setCurrentPlayer(2)
        setSelectedCharacter(null)
      } else {
        setGameState(prev => ({ ...prev, player2Character: character }))
        // Воспроизводим звук подтверждения
        CharacterSoundManager.play('confirm')
        // Показываем экран подготовки к бою
        setShowPreparation(true)
        setCountdown(3)
        
        // Запускаем 3-секундный таймер
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              setTimeout(() => {
                navigate('/game')
              }, 100)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    }, 500)
  }

  const handleBack = () => {
    if (currentPlayer === 2) {
      setCurrentPlayer(1)
      setGameState(prev => ({ ...prev, player1Character: null }))
    } else {
      navigate('/')
    }
  }

  const player1Character = gameState.player1Character
  const player2Character = gameState.player2Character
  const displayCharacter = hoveredCharacter || selectedCharacter

  // Экран подготовки к бою
  if (showPreparation) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-900 via-black to-yellow-900"></div>
        
        {/* Main content */}
        <div className="z-20 text-center">
          <h1 className="text-8xl font-bold text-red-500 mb-8 animate-pulse">
            FIGHTERS SELECTED!
          </h1>
          
          <div className="flex items-center justify-center space-x-16 mb-12">
            {/* Player 1 */}
            <div className="text-center">
              <div className="w-64 h-80 mb-4 flex items-end justify-center">
                <img
                  src={player1Character.fullBody}
                  alt={player1Character.displayName}
                  className="max-w-full max-h-full object-contain"
                  style={{ 
                    imageRendering: 'pixelated',
                    transform: 'scale(2)'
                  }}
                />
              </div>
              <h3 className="text-4xl font-bold text-yellow-400 mb-2">
                {player1Character.displayName.toUpperCase()}
              </h3>
              <div className="text-green-400 text-2xl font-bold">PLAYER 1</div>
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="text-8xl font-bold text-red-500 animate-pulse mb-4">VS</div>
              <div className="text-6xl font-bold text-yellow-400">{countdown}</div>
            </div>

            {/* Player 2 */}
            <div className="text-center">
              <div className="w-64 h-80 mb-4 flex items-end justify-center">
                <img
                  src={player2Character.fullBody}
                  alt={player2Character.displayName}
                  className="max-w-full max-h-full object-contain scale-x-[-1]"
                  style={{ 
                    imageRendering: 'pixelated',
                    transform: 'scaleX(-1) scale(2)'
                  }}
                />
              </div>
              <h3 className="text-4xl font-bold text-yellow-400 mb-2">
                {player2Character.displayName.toUpperCase()}
              </h3>
              <div className="text-blue-400 text-2xl font-bold">PLAYER 2</div>
            </div>
          </div>

          <div className="text-3xl text-yellow-400 animate-pulse">
            PREPARING FOR ARENA SELECTION...
          </div>
        </div>

        {/* Animated elements */}
        <div className="absolute top-20 left-20 w-16 h-16 border-4 border-red-500 rotate-45 animate-spin opacity-50"></div>
        <div className="absolute bottom-20 right-20 w-12 h-12 border-4 border-yellow-400 rotate-45 animate-spin opacity-50"></div>
        <div className="absolute top-1/2 left-20 w-8 h-8 border-4 border-red-500 rotate-45 animate-pulse opacity-30"></div>
        <div className="absolute top-1/2 right-20 w-8 h-8 border-4 border-yellow-400 rotate-45 animate-pulse opacity-30"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-black"></div>
      
      {/* Main title */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <h1 className="text-6xl font-bold text-yellow-400 text-center tracking-wider">
          SELECT YOUR FIGHTER
        </h1>
      </div>

      <div className="flex h-screen items-center justify-center">
        
        {/* Player 1 - Left Side */}
        <div className="w-1/3 h-full flex flex-col items-center justify-center">
          {player1Character ? (
            <div className="text-center">
              {/* Large fighter image */}
              <div className="w-80 h-96 mb-8 flex items-end justify-center">
                <img
                  src={player1Character.fullBody}
                  alt={player1Character.displayName}
                  className="max-w-full max-h-full object-contain"
                  style={{ 
                    imageRendering: 'pixelated',
                    transform: 'scale(2.5)'
                  }}
                />
              </div>
              <h3 className="text-4xl font-bold text-yellow-400 mb-2">
                {player1Character.displayName.toUpperCase()}
              </h3>
              <div className="text-red-500 text-2xl font-bold">PLAYER 1</div>
            </div>
          ) : currentPlayer === 1 ? (
            <div className="text-center">
              <div className="w-80 h-96 mb-8 border-4 border-dashed border-yellow-400 flex items-center justify-center">
                <div className="text-yellow-400 text-9xl">?</div>
              </div>
              <h3 className="text-3xl text-yellow-400 font-bold">SELECT FIGHTER</h3>
              <div className="text-red-500 text-2xl font-bold">PLAYER 1</div>
            </div>
          ) : (
            <div className="text-center opacity-50">
              <div className="w-80 h-96 mb-8 flex items-end justify-center">
                <img
                  src={player1Character?.fullBody}
                  alt={player1Character?.displayName}
                  className="max-w-full max-h-full object-contain grayscale"
                  style={{ 
                    imageRendering: 'pixelated',
                    transform: 'scale(2.5)'
                  }}
                />
              </div>
              <h3 className="text-3xl text-gray-400 font-bold">
                {player1Character?.displayName?.toUpperCase()}
              </h3>
              <div className="text-gray-500 text-xl font-bold">PLAYER 1</div>
            </div>
          )}
        </div>

        {/* Character Grid - Center */}
        <div className="w-1/3 flex items-center justify-center">
          <div className="relative">
            
            {/* Character Grid */}
            <div className="grid grid-cols-5 gap-3 bg-gray-900 p-8 border-8 border-yellow-400 shadow-2xl">
              {CHARACTERS.map((character, index) => (
                <div
                  key={character.id}
                  className={`
                    w-24 h-32 cursor-pointer relative transition-all duration-200
                    ${character.empty ? 'bg-gray-800 border-2 border-gray-700' : 'bg-gray-700 hover:bg-gray-600 border-2 border-gray-600'}
                    ${selectedCharacter?.id === character.id ? 'ring-4 ring-red-500 border-red-500' : ''}
                    ${hoveredCharacter?.id === character.id ? 'ring-4 ring-yellow-400 border-yellow-400' : ''}
                    ${player1Character?.id === character.id ? 'ring-4 ring-green-500 border-green-500' : ''}
                    ${player2Character?.id === character.id ? 'ring-4 ring-blue-500 border-blue-500' : ''}
                  `}
                  onClick={() => handleCharacterSelect(character)}
                  onMouseEnter={() => !character.empty && setHoveredCharacter(character)}
                  onMouseLeave={() => setHoveredCharacter(null)}
                >
                  {!character.empty && (
                    <img
                      src={character.portrait}
                      alt={character.displayName}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iMTI4IiB2aWV3Qm94PSIwIDAgOTYgMTI4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iOTYiIGhlaWdodD0iMTI4IiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjQ4IiB5PSI3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmJiZjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj4/Pz88L3RleHQ+Cjwvc3ZnPgo='
                      }}
                    />
                  )}
                  
                  {selectedCharacter?.id === character.id && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-40 flex items-center justify-center">
                      <div className="text-white text-sm font-bold">SELECTED</div>
                    </div>
                  )}

                  {player1Character?.id === character.id && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded font-bold">
                      P1
                    </div>
                  )}

                  {player2Character?.id === character.id && (
                    <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded font-bold">
                      P2
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom title bar */}
            <div className="absolute -bottom-16 left-0 right-0 text-center">
              <div className="bg-yellow-400 text-black font-bold py-3 px-8 text-2xl tracking-wider">
                KOMBAT ZONE: SOUL CHAMBER
              </div>
            </div>
          </div>
        </div>

        {/* Player 2 - Right Side */}
        <div className="w-1/3 h-full flex flex-col items-center justify-center">
          {player2Character ? (
            <div className="text-center">
              {/* Large fighter image - mirrored */}
              <div className="w-80 h-96 mb-8 flex items-end justify-center">
                <img
                  src={player2Character.fullBody}
                  alt={player2Character.displayName}
                  className="max-w-full max-h-full object-contain scale-x-[-1]"
                  style={{ 
                    imageRendering: 'pixelated',
                    transform: 'scaleX(-1) scale(2.5)'
                  }}
                />
              </div>
              <h3 className="text-4xl font-bold text-yellow-400 mb-2">
                {player2Character.displayName.toUpperCase()}
              </h3>
              <div className="text-red-500 text-2xl font-bold">PLAYER 2</div>
            </div>
          ) : currentPlayer === 2 ? (
            <div className="text-center">
              <div className="w-80 h-96 mb-8 border-4 border-dashed border-yellow-400 flex items-center justify-center">
                <div className="text-yellow-400 text-9xl">?</div>
              </div>
              <h3 className="text-3xl text-yellow-400 font-bold">SELECT FIGHTER</h3>
              <div className="text-red-500 text-2xl font-bold">PLAYER 2</div>
            </div>
          ) : (
            <div className="text-center opacity-30">
              <div className="w-80 h-96 mb-8 border-4 border-dashed border-gray-600 flex items-center justify-center">
                <div className="text-gray-600 text-9xl">?</div>
              </div>
              <h3 className="text-3xl text-gray-600 font-bold">WAITING...</h3>
              <div className="text-gray-600 text-xl font-bold">PLAYER 2</div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Character Info - Bottom */}
      {displayCharacter && !displayCharacter.empty && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="bg-black bg-opacity-90 px-8 py-4 rounded-lg border-2 border-yellow-400">
            <h3 className="text-3xl font-bold text-yellow-400">
              {displayCharacter.displayName.toUpperCase()}
            </h3>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-8">
        <button
          onClick={handleBack}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded text-xl border-2 border-gray-500"
        >
          ← BACK
        </button>
      </div>

      <div className="absolute bottom-8 right-8 text-gray-400 text-lg text-right">
        <p>Click to select fighter</p>
        <p>ESC - Cancel</p>
      </div>

      {/* Player indicator */}
      {currentPlayer && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2">
          <div className="bg-red-500 text-white font-bold py-2 px-8 rounded text-2xl">
            PLAYER {currentPlayer} - CHOOSE YOUR FIGHTER
          </div>
        </div>
      )}
    </div>
  )
} 