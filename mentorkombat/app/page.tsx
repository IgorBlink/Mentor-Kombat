"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Demo as Avatars } from "@/components/avatars"
import { useSoundContext } from "@/components/sound-context"

export default function IntroScreen() {
  const router = useRouter()
  const [showStart] = useState(true)
  const [gameMode, setGameMode] = useState<"single" | "multiplayer">("single")
  const { playSound, startBackgroundMusic, stopBackgroundMusic } = useSoundContext()

  // Запуск фоновой музыки только после взаимодействия пользователя
  const [musicStartedByUser, setMusicStartedByUser] = useState(false)
  
  const handleUserInteraction = () => {
    if (!musicStartedByUser) {
      startBackgroundMusic()
      setMusicStartedByUser(true)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleUserInteraction()
      if (e.key === "Enter") {
        stopBackgroundMusic()
        playSound("/sounds/mixkit-soft-quick-punch-2151.wav")
        router.push(`/select?mode=${gameMode}`)
      } else if (e.key === "Tab") {
        e.preventDefault()
        // Hit sound removed - file not found
        setGameMode(prev => prev === "single" ? "multiplayer" : "single")
      }
    }

    const handleClick = () => {
      handleUserInteraction()
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("click", handleClick)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("click", handleClick)
    }
  }, [router, gameMode, playSound, musicStartedByUser])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background with Berlin skyline */}
      <div className="absolute inset-0 z-0 bg-[#001428] pixelated w-full h-full">
        <Image
          src="/images/BACKGROUND.avif"
          alt="nFactorial Mentor Kombat"
          fill
          className="object-cover pixelated"
          priority
        />
      </div>

      {/* Top right corner avatars */}
      <div className="absolute top-12 right-4 z-20" style={{ position: 'fixed', top: '3rem', right: '1rem', zIndex: 20 }}>
        <Avatars />
      </div>

      <div className="relative z-10 flex flex-col h-screen justify-center items-center py-8">
        {/* Title */}
        <div className="mb-16">
          <div className="game-text red-blood text-[4rem] text-center font-bold">
            n! Mentor Kombat
          </div>
        </div>

        {/* Game Mode Selection */}
        <div className="flex flex-col items-center space-y-8">
          <div className="bg-black/80 rounded-lg p-6 flex items-center space-x-6">
            <div className="game-text text-white text-xl">Select Game Mode:</div>
            
            {/* Toggle Switch */}
            <div className="flex items-center space-x-4">
              <div 
                className="relative w-16 h-8 bg-gray-600 rounded-full cursor-pointer transition-colors duration-300"
                onClick={() => {
                  startBackgroundMusic()
                  // Hit sound removed - file not found
                  setGameMode(prev => prev === "single" ? "multiplayer" : "single")
                }}
              >
                <div 
                  className={`absolute top-1 w-6 h-6 bg-orange-400 rounded-full transition-transform duration-300 ${
                    gameMode === "multiplayer" ? "transform translate-x-8" : "transform translate-x-1"
                  }`}
                />
              </div>
            </div>

            {/* Mode Description */}
            <div className="text-center text-sm text-gray-300 game-text">
              {gameMode === "single" 
                ? "Singleplayer"
                : "Multiplayer"
              }
            </div>
          </div>

          <div className={`game-text text-white text-2xl ${showStart ? "blink" : ""}`}>
            Press ENTER to Start & TAB to switch modes
          </div>
        </div>
      </div>
    </div>
  )
}
