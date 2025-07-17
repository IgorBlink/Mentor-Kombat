"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { fighters } from "@/lib/fighters"
import { Component as Lightning } from "@/components/ui/lightning";

export default function CharacterSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameMode = searchParams.get("mode") || "single"
  
  // Single player state
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  // Multiplayer state
  const [player1Index, setPlayer1Index] = useState(0)
  const [player2Index, setPlayer2Index] = useState(1)
  const [selectedPlayer1, setSelectedPlayer1] = useState<string | null>(null)
  const [selectedPlayer2, setSelectedPlayer2] = useState<string | null>(null)
  
  const [showStart, setShowStart] = useState(true)

  const isMultiplayer = gameMode === "multiplayer"

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMultiplayer) {
        // Multiplayer controls
        switch (e.key) {
          // Player 1 controls (Arrow keys)
          case "ArrowRight":
            if (!selectedPlayer1) {
              setPlayer1Index((prev) => (prev + 1) % fighters.length)
            }
            break
          case "ArrowLeft":
            if (!selectedPlayer1) {
              setPlayer1Index((prev) => (prev - 1 + fighters.length) % fighters.length)
            }
            break
          case "ArrowUp":
            if (!selectedPlayer1) {
              setPlayer1Index((prev) => {
                if (prev < 3) return prev + 3
                return prev - 3
              })
            }
            break
          case "ArrowDown":
            if (!selectedPlayer1) {
              setPlayer1Index((prev) => {
                if (prev >= 3) return prev - 3
                return prev + 3
              })
            }
            break
          case "Enter":
            if (!selectedPlayer1) {
              setSelectedPlayer1(fighters[player1Index].id)
            } else if (!selectedPlayer2) {
              setSelectedPlayer2(fighters[player2Index].id)
            }
            break
          
          // Player 2 controls (WASD)
          case "d":
          case "D":
            if (!selectedPlayer2) {
              setPlayer2Index((prev) => (prev + 1) % fighters.length)
            }
            break
          case "a":
          case "A":
            if (!selectedPlayer2) {
              setPlayer2Index((prev) => (prev - 1 + fighters.length) % fighters.length)
            }
            break
          case "w":
          case "W":
            if (!selectedPlayer2) {
              setPlayer2Index((prev) => {
                if (prev < 3) return prev + 3
                return prev - 3
              })
            }
            break
          case "s":
          case "S":
            if (!selectedPlayer2) {
              setPlayer2Index((prev) => {
                if (prev >= 3) return prev - 3
                return prev + 3
              })
            }
            break
          case "q":
          case "Q":
            if (!selectedPlayer2) {
              setSelectedPlayer2(fighters[player2Index].id)
            }
            break
        }

        // Start game when both players selected
        if (selectedPlayer1 && selectedPlayer2) {
          router.push(`/fight?mode=multiplayer&player1=${selectedPlayer1}&player2=${selectedPlayer2}`)
        }
      } else {
        // Single player controls (original)
        switch (e.key) {
          case "ArrowRight":
            setSelectedIndex((prev) => (prev + 1) % fighters.length)
            break
          case "ArrowLeft":
            setSelectedIndex((prev) => (prev - 1 + fighters.length) % fighters.length)
            break
          case "ArrowUp":
            setSelectedIndex((prev) => {
              if (prev < 3) return prev + 3
              return prev - 3
            })
            break
          case "ArrowDown":
            setSelectedIndex((prev) => {
              if (prev >= 3) return prev - 3
              return prev + 3
            })
            break
          case "Enter":
            router.push(`/fight?player=${fighters[selectedIndex].id}&round=1&difficulty=1.0&prevOpponents=`)
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, player1Index, player2Index, selectedPlayer1, selectedPlayer2, router, isMultiplayer])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowStart((prev) => !prev)
    }, 700)
    return () => clearInterval(interval)
  }, [])

  const getCharacterBorder = (index: number) => {
    if (!isMultiplayer) {
      return selectedIndex === index 
        ? "ring-2 ring-white transform transition-all duration-300" 
        : "transition-all duration-300 hover:ring-2 hover:ring-white"
    }

    // Multiplayer borders
    let borderClass = "transition-all duration-300 hover:ring-2 hover:ring-white"
    
    if (selectedPlayer1 === fighters[index].id) {
      borderClass = "ring-4 ring-blue-500 transform transition-all duration-300"
    } else if (selectedPlayer2 === fighters[index].id) {
      borderClass = "ring-4 ring-red-500 transform transition-all duration-300"
    } else if (player1Index === index && !selectedPlayer1) {
      borderClass = "ring-2 ring-blue-300 transform transition-all duration-300"
    } else if (player2Index === index && !selectedPlayer2) {
      borderClass = "ring-2 ring-red-300 transform transition-all duration-300"
    }

    return borderClass
  }

  const getSelectedFighterInfo = () => {
    if (!isMultiplayer) {
      return fighters[selectedIndex]
    }

    if (!selectedPlayer1) {
      return fighters[player1Index]
    } else if (!selectedPlayer2) {
      return fighters[player2Index]
    } else {
      return null // Both selected
    }
  }

  const getInstructionText = () => {
    if (!isMultiplayer) {
      return "Press ENTER to fight | Use arrow keys to navigate"
    }

    if (!selectedPlayer1) {
      return "Player 1: Use arrow keys to select, ENTER to confirm"
    } else if (!selectedPlayer2) {
      return "Player 2: Use WASD to select, Q to confirm"
    } else {
      return "Both players ready! Starting fight..."
    }
  }

  const selectedFighter = getSelectedFighterInfo()

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Lightning background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Lightning hue={220} speed={0.7} intensity={1.2} size={1.5} />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Main container */}
      <div className="relative z-10 h-screen flex flex-col justify-between py-2">
        {/* Header */}
        <div className="flex-shrink-0">
          <h2 className="game-title text-2xl text-center brightness-125">
            {isMultiplayer ? "Select Your Fighters" : "Select Your Fighter"}
          </h2>
          {isMultiplayer && (
            <div className="flex justify-center space-x-8 mt-2">
              <div className="text-center">
                <div className="game-text text-blue-400 text-sm">Player 1</div>
                <div className="game-text text-xs text-gray-300">Arrow Keys + Enter</div>
              </div>
              <div className="text-center">
                <div className="game-text text-red-400 text-sm">Player 2</div>
                <div className="game-text text-xs text-gray-300">WASD + Q</div>
              </div>
            </div>
          )}
        </div>

        {/* Fighter Grid */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-3 grid-rows-2 gap-x-12 gap-y-12 max-w-2xl">
            {fighters.map((fighter, index) => (
              <div
                key={fighter.id}
                className={`relative w-20 h-20 cursor-pointer flex flex-col justify-end m-2 ${getCharacterBorder(index)}`}
                onClick={() => {
                  if (!isMultiplayer) {
                    setSelectedIndex(index)
                  }
                }}
              >
                <Image
                  src={fighter.portrait || "/placeholder.svg"}
                  alt={fighter.name}
                  width={80}
                  height={80}
                  className="pixelated w-full h-full object-cover rounded"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-center text-xs py-1 game-text text-white rounded-b pointer-events-none flex items-center justify-center" style={{minHeight: '1.5em'}}>
                  {fighter.name}
                </div>
                
                {/* Player indicators for multiplayer */}
                {isMultiplayer && (
                  <>
                    {selectedPlayer1 === fighter.id && (
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        P1
                      </div>
                    )}
                    {selectedPlayer2 === fighter.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        P2
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Fighter Info or Both Players Status */}
        <div className="flex-shrink-0 px-4">
          {isMultiplayer && selectedPlayer1 && selectedPlayer2 ? (
            // Both players selected - show both
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between space-x-4">
                <div className="flex-1 text-center game-text bg-black/70 rounded p-2">
                  <div className="game-title mb-1 text-blue-400 font-bold break-words">
                    {fighters.find(f => f.id === selectedPlayer1)?.name}
                  </div>
                  <div className="text-xs text-gray-300 break-words">
                    {fighters.find(f => f.id === selectedPlayer1)?.description}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="game-text text-2xl text-orange-400">VS</div>
                </div>
                <div className="flex-1 text-center game-text bg-black/70 rounded p-2">
                  <div className="game-title mb-1 text-red-400 font-bold break-words">
                    {fighters.find(f => f.id === selectedPlayer2)?.name}
                  </div>
                  <div className="text-xs text-gray-300 break-words">
                    {fighters.find(f => f.id === selectedPlayer2)?.description}
                  </div>
                </div>
              </div>
            </div>
          ) : selectedFighter ? (
            // Single selection info
            <div className="max-w-xl mx-auto text-center game-text bg-black/70 rounded p-2" style={{maxHeight: "22vh", overflowY: "auto", minHeight: "80px", lineHeight: "1.7"}}>
              <div className="game-title mb-1 text-white font-bold break-words">{selectedFighter.name}</div>
              <div className="text-xs mb-1 text-gray-300 break-words">{selectedFighter.description}</div>
              <div className="text-xs mb-2 text-orange-400 font-bold break-words">Special: {selectedFighter.specialMove}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
