"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function IntroScreen() {
  const router = useRouter()
  const [showStart, setShowStart] = useState(true)
  const [gameMode, setGameMode] = useState<"single" | "multiplayer">("single")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        router.push(`/select?mode=${gameMode}`)
      } else if (e.key === "Tab") {
        e.preventDefault()
        setGameMode(prev => prev === "single" ? "multiplayer" : "single")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router, gameMode])

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

      <div className="relative z-10 flex flex-col h-screen justify-between py-8">
        {/* Title */}
        <div className="flex-1 flex items-center justify-center">
          <div className="game-text red-blood text-[4rem] text-center font-bold">
            n! Mentor Kombat
          </div>
        </div>

        {/* Game Mode Selection */}
        <div className="flex flex-col items-center space-y-6 pb-8">
          <div className="bg-black/80 rounded-lg p-6 flex flex-col items-center space-y-4">
            <div className="game-text text-white text-xl">Select Game Mode</div>
            
            {/* Toggle Switch */}
            <div className="flex items-center space-x-4">
              <span className={`game-text text-sm ${gameMode === "single" ? "text-orange-400" : "text-gray-400"}`}>
                Single Player
              </span>
              
              <div 
                className="relative w-16 h-8 bg-gray-600 rounded-full cursor-pointer transition-colors duration-300"
                onClick={() => setGameMode(prev => prev === "single" ? "multiplayer" : "single")}
              >
                <div 
                  className={`absolute top-1 w-6 h-6 bg-orange-400 rounded-full transition-transform duration-300 ${
                    gameMode === "multiplayer" ? "transform translate-x-8" : "transform translate-x-1"
                  }`}
                />
              </div>
              
              <span className={`game-text text-sm ${gameMode === "multiplayer" ? "text-orange-400" : "text-gray-400"}`}>
                Multiplayer
              </span>
            </div>

            {/* Mode Description */}
            <div className="text-center text-xs text-gray-300 game-text max-w-xs leading-relaxed">
              {gameMode === "single" 
                ? "Fight against AI opponents with increasing difficulty"
                : "Two players on one keyboard - Player 1: Arrow keys + JKL, Player 2: WASD + QER"
              }
            </div>
          </div>

          <div className={`game-text text-white text-2xl ${showStart ? "blink" : ""}`}>
            Press ENTER to Start
          </div>
          
          <div className="game-text text-white text-sm opacity-80">
            Press TAB to switch modes
          </div>
        </div>
      </div>
    </div>
  )
}
