"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { fighters } from "@/lib/fighters"
import { BalatroBackground } from "@/components/ui/balatro"
import { LiquidChromeBackground } from "@/components/ui/liquid-chrome"
import { useSoundContext } from "@/components/sound-context"

export default function WinnerScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { playSound, stopBackgroundMusic } = useSoundContext()
  
  const winner = searchParams.get("winner")
  const gameMode = searchParams.get("mode") || "single"
  const isMultiplayer = gameMode === "multiplayer"
  
  // Get fighter IDs
  const playerId = searchParams.get("player") || fighters[0].id
  const opponentId = searchParams.get("opponent") || searchParams.get("cpu") || fighters[1].id
  
  // Single player specific params
  const roundCount = Number.parseInt(searchParams.get("round") || "1", 10)
  const difficulty = Number.parseFloat(searchParams.get("difficulty") || "1.0")
  const previousOpponentsParam = searchParams.get("prevOpponents") || ""
  const previousOpponents = previousOpponentsParam ? previousOpponentsParam.split(",") : []

  const playerFighter = fighters.find((f) => f.id === playerId) || fighters[0]
  const opponentFighter = fighters.find((f) => f.id === opponentId) || fighters[1]

  const [showContinue, setShowContinue] = useState(true)
  const [countdown, setCountdown] = useState(5)
  const [isCountingDown] = useState(winner === "player" && !isMultiplayer)

  // Play victory or defeat sound on component mount
  useEffect(() => {
    if (winner === "player") {
      playSound("/sounds/mixkit-video-game-win-2016.wav", { category: 'ambient', volume: 0.8 })
    } else {
      playSound("/sounds/mixkit-player-losing-or-failing-2042.wav", { category: 'ambient', volume: 0.8 })
    }
  }, [winner, playSound])

  // Function to start next round or return to menu
  const handleNextAction = useCallback(() => {
    if (isMultiplayer) {
      // In multiplayer, always return to character select
      stopBackgroundMusic()
      router.push("/select?mode=multiplayer")
    } else if (winner === "player") {
      // Single player: continue to next round
      // const opponentsToAvoid = [playerId, opponentId, ...previousOpponents] // Unused variable
      // const availableFighters = fighters.filter((f) => !opponentsToAvoid.includes(f.id)) // Unused variable

      // const fightersToChooseFrom =
      //   availableFighters.length > 0 ? availableFighters : fighters.filter((f) => f.id !== opponentId && f.id !== playerId)

      // const randomIndex = Math.floor(Math.random() * fightersToChooseFrom.length) // Unused variable
      // const newOpponent = fightersToChooseFrom[randomIndex] // Unused variable

      const updatedPreviousOpponents = [...previousOpponents, opponentId].slice(-4)
      const newDifficulty = difficulty + 0.2

      router.push(
        `/fight?player=${playerId}&round=${roundCount + 1}&difficulty=${newDifficulty.toFixed(1)}&prevOpponents=${updatedPreviousOpponents.join(",")}`,
      )
    } else {
      // Player lost in single player
      router.push("/")
    }
  }, [router, winner, playerId, opponentId, roundCount, difficulty, previousOpponents, isMultiplayer, stopBackgroundMusic])

  // Handle countdown timer (only for single player victories)
  useEffect(() => {
    if (!isCountingDown) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleNextAction()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isCountingDown, handleNextAction])

  // Blink effect for continue text
  useEffect(() => {
    const interval = setInterval(() => {
      setShowContinue((prev) => !prev)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleNextAction()
      } else if (e.key === "Escape") {
        router.push("/")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router, handleNextAction])

  // Determine display text based on mode and winner
  const getWinnerText = () => {
    if (isMultiplayer) {
      return winner === "player" ? "Player 1 Wins!" : "Player 2 Wins!"
    }
    return winner === "player" ? "You Won!" : "You Lost!"
  }

  const getContinueText = () => {
    if (isMultiplayer) {
      return "PRESS ENTER TO PLAY AGAIN"
    }
    return winner === "player" ? "PRESS ENTER FOR NEXT ROUND" : "PRESS ENTER TO PLAY AGAIN"
  }

  const getEscapeText = () => {
    if (isMultiplayer) {
      return "PRESS ESC TO RETURN TO MENU"
    }
    return winner === "player" ? "PRESS ESC TO RETURN TO MENU" : ""
  }

  // Determine which fighter won and which lost
  const winnerFighter = winner === "player" ? playerFighter : opponentFighter
  const loserFighter = winner === "player" ? opponentFighter : playerFighter

  // Get the appropriate sprite based on win/lose state
  const spriteToShow =
    winner === "player"
      ? winnerFighter.wonSprite || "/images/victory.png"
      : loserFighter.lostSprite || "/images/defeat.png"

  // Get the appropriate background and text color based on win/lose state
  // const backgroundImage = winner === "player" ? "/images/youwon.jpg" : "/images/youlost.jpg" // Unused variable
  const titleColor = winner === "player" ? "#5D1A11" : "#361E13"

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      {winner === "player" ? (
         <>
           <LiquidChromeBackground
             baseColor={[0.8, 0.6, 0.2]}
             speed={0.3}
             amplitude={0.4}
             frequencyX={4}
             frequencyY={3}
             interactive={true}
           />
           <div className="absolute inset-0 bg-black/20 z-5" />
         </>
       ) : (
        <>
          <BalatroBackground
            spinRotation={-3.0}
            spinSpeed={2.0}
            color1="#8B0000"
            color2="#DC143C"
            color3="#B22222"
            contrast={1.5}
            lighting={0.3}
            spinAmount={0.8}
            pixelFilter={250.0}
            spinEase={1.5}
            isRotate={true}
            mouseInteraction={true}
          />
          <div className="absolute inset-0 bg-black/40 z-5" />
        </>
      )}

      <div className="relative z-10 flex flex-col h-screen justify-between py-4">
        <div className="flex-shrink-0 text-center">
          <h1 className="game-title text-4xl" style={{ color: titleColor }}>
            {getWinnerText()}
          </h1>
          {isMultiplayer && (
            <div className="mt-4">
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className={`game-text text-lg ${winner === "player" ? "text-blue-400" : "text-gray-400"}`}>
                    Player 1: {playerFighter.name}
                  </div>
                </div>
                <div className="game-text text-lg text-orange-400">VS</div>
                <div className="text-center">
                  <div className={`game-text text-lg ${winner === "opponent" ? "text-red-400" : "text-gray-400"}`}>
                    Player 2: {opponentFighter.name}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center">
          {/* Position sprite at the center */}
          <div className="relative w-80 h-80 flex items-center justify-center">
            <Image
              src={spriteToShow || "/placeholder.svg"}
              alt={winner === "player" ? "Victorious Fighter" : "Defeated Fighter"}
              width={320}
              height={320}
              className="pixelated object-contain"
            />
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-center mb-8 pb-4 winner-bottom-text">
          <div className={`game-text text-lg ${showContinue ? "blink" : "opacity-0"}`}>
            {getContinueText()}
          </div>

          {getEscapeText() && (
            <div className="game-text text-sm mt-1" style={{ color: titleColor }}>
              {getEscapeText()}
            </div>
          )}

          {/* Show countdown only for single player victories */}
          {isCountingDown && (
            <div className="game-text text-sm mt-2 text-orange-400">
              Auto-continue in {countdown}s
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
