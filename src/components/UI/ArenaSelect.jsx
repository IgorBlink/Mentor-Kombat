import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ARENAS = [
  {
    id: 0,
    name: 'Throne Room',
    displayName: 'Зал Совета',
    description: 'Священное место принятия важных решений в Nfactorial',
    image: '/mk.js/game/images/arenas/0/arena.png',
    difficulty: 'Normal',
    features: ['Классическая арена', 'Отличная видимость', 'Стандартные размеры']
  },
  {
    id: 1,
    name: 'Warrior Temple',
    displayName: 'Храм Воинов',
    description: 'Мистическое место для эпических битв',
    image: '/mk.js/game/images/arenas/1/arena.png',
    difficulty: 'Hard',
    features: ['Опасные препятствия', 'Динамическое освещение', 'Секретные проходы']
  }
]

export default function ArenaSelect({ gameState, setGameState }) {
  const navigate = useNavigate()
  const [selectedArena, setSelectedArena] = useState(null)
  const [hoveredArena, setHoveredArena] = useState(null)

  const handleArenaSelect = (arena) => {
    setSelectedArena(arena)
    setGameState(prev => ({ ...prev, selectedArena: arena }))
    
    // Переходим к игре
    setTimeout(() => {
      navigate('/game')
    }, 1000)
  }

  const handleBack = () => {
    navigate('/character-select')
  }

  const displayArena = hoveredArena || selectedArena

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-600 to-gray-900"></div>
      
      {/* Header */}
      <div className="relative z-10 text-center py-8">
        <h1 className="text-5xl font-bold text-yellow-400 animate-glow">
          CHOOSE YOUR BATTLEGROUND
        </h1>
        <p className="text-2xl text-red-500 mt-2">
          Выберите арену для боя
        </p>
        <div className="text-lg text-gray-300 mt-4 space-y-1">
          <p>Player 1: {gameState.player1Character?.displayName} ({gameState.player1Character?.name})</p>
          <p>Player 2: {gameState.player2Character?.displayName} ({gameState.player2Character?.name})</p>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Arena Grid */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {ARENAS.map((arena) => (
              <div
                key={arena.id}
                className={`character-card h-64 w-80 relative cursor-pointer ${
                  selectedArena?.id === arena.id ? 'selected' : ''
                }`}
                onClick={() => handleArenaSelect(arena)}
                onMouseEnter={() => setHoveredArena(arena)}
                onMouseLeave={() => setHoveredArena(null)}
              >
                <img
                  src={arena.image}
                  alt={arena.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDMyMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTkyIiBmaWxsPSIjMmQyZDJkIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmZmQ3MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFSRU5BPC90ZXh0Pgo8L3N2Zz4K'
                  }}
                />
                
                <div className="p-4 text-center">
                  <h3 className="text-xl font-bold text-yellow-400">
                    {arena.displayName}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {arena.name}
                  </p>
                </div>

                {/* Selection Effect */}
                {selectedArena?.id === arena.id && (
                  <div className="absolute inset-0 border-4 border-red-500 rounded-lg animate-pulse"></div>
                )}

                {/* Difficulty Badge */}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                  arena.difficulty === 'Normal' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {arena.difficulty}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arena Info Panel */}
        <div className="w-1/3 bg-gray-600 bg-opacity-90 p-8 flex flex-col justify-center">
          {displayArena ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-yellow-400">
                  {displayArena.displayName}
                </h2>
                <p className="text-xl text-red-500">
                  {displayArena.name}
                </p>
                <div className="w-32 h-1 bg-yellow-400 mx-auto mt-2"></div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-300">Description:</h3>
                  <p className="text-gray-400">{displayArena.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-300">Difficulty:</h3>
                  <p className={`font-bold ${
                    displayArena.difficulty === 'Normal' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {displayArena.difficulty}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-300">Features:</h3>
                  <ul className="text-gray-400 space-y-1">
                    {displayArena.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedArena && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500 animate-pulse">
                    АРЕНА ВЫБРАНА!
                  </div>
                  <p className="text-lg text-gray-300 mt-2">
                    Подготовка к бою...
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <h2 className="text-2xl font-bold">Выберите арену</h2>
              <p className="mt-4">Наведите курсор на арену для просмотра информации</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-8 z-10">
        <button
          onClick={handleBack}
          className="btn-secondary"
        >
          ← Назад
        </button>
      </div>

      <div className="absolute bottom-8 right-8 z-10 text-gray-400 text-right">
        <p>Нажмите на арену для выбора</p>
        <p>ESC - отмена</p>
      </div>
    </div>
  )
} 