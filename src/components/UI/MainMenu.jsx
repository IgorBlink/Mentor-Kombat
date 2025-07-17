import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MainMenu() {
  const navigate = useNavigate()
  const [animationClass, setAnimationClass] = useState('')
  const [keyLayout, setKeyLayout] = useState('standard') // 'standard' или 'alternative'

  useEffect(() => {
    // Добавляем анимацию появления
    const timer = setTimeout(() => {
      setAnimationClass('animate-pulse-slow')
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  const handleStartGame = () => {
    // Устанавливаем раскладку перед началом игры
    if (window.mk && window.mk.controllers && window.mk.controllers.setKeyLayout) {
      window.mk.controllers.setKeyLayout(keyLayout)
    }
    navigate('/character-select')
  }

  const toggleKeyLayout = () => {
    setKeyLayout(prev => prev === 'standard' ? 'alternative' : 'standard')
  }

  const getLayoutDescription = () => {
    if (keyLayout === 'standard') {
      return {
        name: 'Стандартная',
        p1: 'P1: WASD движение, Q/E удары, Z/X кики, Shift блок',
        p2: 'P2: Стрелки движение, O/P удары, ,/. кики, / блок',
        description: 'Универсальная раскладка: WASD + стрелки + буквы'
      }
    } else {
      return {
        name: 'Симметричная',
        p1: 'P1: WASD движение, Q/E удары, Z/X кики, Shift блок',
        p2: 'P2: IJKL движение, U/O удары, N/M кики, Enter блок',
        description: 'Симметричная раскладка для удобства'
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-red-500/20 to-yellow-500/20"></div>
      </div>
      
              {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-yellow-400 rotate-45 animate-spin opacity-30"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-red-500 rotate-45 animate-spin opacity-30"></div>
        <div className="absolute top-1/2 left-10 w-12 h-12 border-2 border-yellow-400 rotate-45 animate-pulse opacity-20"></div>
      
      {/* Main Content */}
      <div className="z-10 text-center space-y-8">
        {/* Logo/Title */}
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-yellow-400 glow-text tracking-wider">
            NFACTORIAL
          </h1>
          <h2 className="text-6xl font-bold text-red-500 glow-text tracking-wider">
            MENTOR COMBAT
          </h2>
          <div className="w-64 h-1 bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 mx-auto rounded-full"></div>
        </div>

        {/* Subtitle */}
        <p className="text-2xl text-gray-300 font-semibold tracking-wide opacity-80">
          Выберите своего ментора и сражайтесь за знания!
        </p>

        {/* Menu Buttons */}
        <div className="space-y-6 pt-8">
          <button 
            onClick={handleStartGame}
            className={`btn-primary text-2xl px-12 py-4 ${animationClass}`}
          >
            🥊 НАЧАТЬ БОЙ
          </button>
          
          {/* Выбор раскладки клавиш */}
         
          
          <div className="space-y-4">
            <button className="btn-secondary text-xl px-10 py-3 block mx-auto">
              🏆 ТАБЛИЦА ЛИДЕРОВ
            </button>
            <button className="btn-secondary text-xl px-10 py-3 block mx-auto">
              ⚙️ НАСТРОЙКИ
            </button>
            <button className="btn-secondary text-xl px-10 py-3 block mx-auto">
              📖 ПРАВИЛА
            </button>
          </div>
        </div>

        {/* Version Info */}
        <div className="absolute bottom-8 left-8 text-sm text-gray-500">
          v1.0.0 - Nfactorial Edition
        </div>

        {/* Controls Info */}
        <div className="absolute bottom-8 right-8 text-sm text-gray-400 text-right">
          <p>Используйте мышь для навигации</p>
          <p>ESC - выход из игры</p>
        </div>
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  )
} 