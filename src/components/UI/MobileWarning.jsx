import { useState, useEffect } from 'react'

export default function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      const isMobileDevice = mobileRegex.test(userAgent)
      const isSmallScreen = window.innerWidth < 1024 // Меньше чем размер для ноутбука
      
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  if (!isMobile) return null

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 animate-glow mb-2">
            NFACTORIAL
          </h1>
          <h2 className="text-3xl font-bold text-red-500 animate-glow">
            MENTOR COMBAT
          </h2>
        </div>

        {/* Mobile Icon */}
        <div className="mb-6">
          <div className="text-6xl mb-4">📱</div>
          <div className="text-4xl text-red-500">❌</div>
        </div>

        {/* Warning Message */}
        <div className="space-y-4 text-center">
          <h3 className="text-2xl font-bold text-yellow-400">
            Мобильная версия недоступна
          </h3>
          
          <p className="text-lg text-gray-300">
            Nfactorial Mentor Combat оптимизирован для работы на компьютере
          </p>

          <div className="bg-gray-600 bg-opacity-50 p-4 rounded-lg mt-6">
            <p className="text-yellow-400 font-semibold mb-2">
              🖥️ Для игры необходимо:
            </p>
            <ul className="text-gray-300 text-left space-y-1">
              <li>• Компьютер или ноутбук</li>
              <li>• Разрешение экрана минимум 1024px</li>
              <li>• Современный браузер</li>
              <li>• Клавиатура для управления</li>
            </ul>
          </div>

          <div className="mt-8 p-4 border-2 border-yellow-400 rounded-lg">
            <p className="text-yellow-400 font-bold mb-2">
              Откройте игру на компьютере!
            </p>
            <p className="text-sm text-gray-400">
              Скопируйте эту ссылку и откройте на ПК для полного игрового опыта
            </p>
          </div>
        </div>

        {/* Animated Elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-2 border-yellow-400 rotate-45 animate-spin opacity-30"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-red-500 rotate-45 animate-spin opacity-30"></div>
        <div className="absolute top-1/2 right-4 w-4 h-4 border-2 border-yellow-400 rotate-45 animate-pulse opacity-20"></div>
      </div>
    </div>
  )
} 