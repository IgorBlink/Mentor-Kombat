"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { fighters } from "@/lib/fighters"
import { Component as Lightning } from "@/components/ui/lightning";
import { useSoundContext } from "@/components/sound-context"

export default function CharacterSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameMode = searchParams.get("mode") || "single"
  const { playSound, preloadSounds } = useSoundContext()

  // Preload combat sounds for better performance
  useEffect(() => {
    const combatSounds = [
      "/sounds/punch.mp3",
      "/sounds/kick.mp3", 
      "/sounds/hit.mp3",
      "/sounds/jump.mp3",
      "/sounds/victory.mp3",
      "/sounds/mixkit-player-losing-or-failing-2042.wav"
    ]
    preloadSounds(combatSounds)
  }, [preloadSounds])
  
  // Single player state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  
  // Multiplayer state
  const [player1Index, setPlayer1Index] = useState<number | null>(null)
  const [player2Index, setPlayer2Index] = useState<number | null>(null)
  const [selectedPlayer1, setSelectedPlayer1] = useState<string | null>(null)
  const [selectedPlayer2, setSelectedPlayer2] = useState<string | null>(null)
  
  // const [showStart, setShowStart] = useState(true) // Unused variable

  const isMultiplayer = gameMode === "multiplayer"



  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isMultiplayer) {
        // Multiplayer controls
        switch (e.key) {
          case "Enter":
            if (!selectedPlayer1 && player1Index !== null) {
              playSound("/sounds/mixkit-retro-game-notification-212.wav", { category: 'ui', volume: 0.7 }) // Более яркий звук подтверждения для игрока 1
              setSelectedPlayer1(fighters[player1Index].id)
            } else if (!selectedPlayer2 && player2Index !== null && selectedPlayer1) {
              playSound("/sounds/mixkit-retro-game-notification-212.wav", { category: 'ui', volume: 0.7 }) // Звук подтверждения для игрока 2
              setSelectedPlayer2(fighters[player2Index].id)
            }
            break
        }

        // Start game when both players selected
        if (selectedPlayer1 && selectedPlayer2) {
          router.push(`/fight?mode=multiplayer&player1=${selectedPlayer1}&player2=${selectedPlayer2}`)
        }
      } else {
        // Single player controls
        switch (e.key) {
          case "Enter":
            if (selectedIndex !== null) {
              playSound("/sounds/mixkit-retro-game-notification-212.wav", { category: 'ui', volume: 0.7 }) // Яркий звук подтверждения выбора
              router.push(`/fight?player=${fighters[selectedIndex].id}&round=1&difficulty=1.0&prevOpponents=`)
            }
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, player1Index, player2Index, selectedPlayer1, selectedPlayer2, router, isMultiplayer, playSound])

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setShowStart((prev) => !prev)
  //   }, 700)
  //   return () => clearInterval(interval)
  // }, [])

  const handleCharacterClick = (index: number) => {
    // Разные звуки для разных действий выбора персонажа
    if (!isMultiplayer) {
      playSound("/sounds/mixkit-retro-game-notification-212.wav", { category: 'ui', volume: 0.6 }) // Звук выбора в одиночной игре
      setSelectedIndex(index)
    } else {
      // В мультиплеере определяем, какой игрок выбирает
      if (!selectedPlayer1) {
        playSound("/sounds/mixkit-retro-game-notification-212.wav", { category: 'ui', volume: 0.6 }) // Звук выбора игрока 1
        setPlayer1Index(index)
      } else if (!selectedPlayer2) {
        playSound("/sounds/mixkit-retro-game-notification-212.wav", { category: 'ui', volume: 0.6 }) // Звук выбора игрока 2
        setPlayer2Index(index)
      }
    }
  }

  const handleCharacterHover = () => {
    // Тихий звук при наведении на персонажа
    playSound("/sounds/jump.mp3", { category: 'ui', volume: 0.4 })
  }

  const getCharacterBorder = (index: number) => {
    if (!isMultiplayer) {
      return selectedIndex === index 
        ? "ring-2 ring-white transition-all duration-300" 
        : "transition-all duration-300 hover:ring-2 hover:ring-white cursor-pointer"
    }

    // Multiplayer borders
    let borderClass = "transition-all duration-300 hover:ring-2 hover:ring-white cursor-pointer"
    
    if (selectedPlayer1 === fighters[index].id) {
      borderClass = "ring-4 ring-blue-500 transform transition-all duration-300"
    } else if (selectedPlayer2 === fighters[index].id) {
      borderClass = "ring-4 ring-red-500 transform transition-all duration-300"
    } else if (player1Index === index && !selectedPlayer1) {
      borderClass = "ring-2 ring-white transform transition-all duration-300"
    } else if (player2Index === index && !selectedPlayer2) {
      borderClass = "ring-2 ring-white transform transition-all duration-300"
    }

    return borderClass
  }

  const getSelectedFighterInfo = () => {
    if (!isMultiplayer) {
      return selectedIndex !== null ? fighters[selectedIndex] : null
    }

    if (!selectedPlayer1 && player1Index !== null) {
      return fighters[player1Index]
    } else if (!selectedPlayer2 && player2Index !== null) {
      return fighters[player2Index]
    } else {
      return null
    }
  }

  const getInstructionText = () => {
    if (!isMultiplayer) {
      return selectedIndex !== null 
        ? "Press ENTER to fight" 
        : "Click on a character to select"
    }

    if (!selectedPlayer1) {
      return player1Index !== null 
        ? "Player 1: Press ENTER to confirm selection" 
        : "Player 1: Click on a character to select"
    } else if (!selectedPlayer2) {
      return player2Index !== null 
        ? "Player 2: Press ENTER to confirm selection" 
        : "Player 2: Click on a character to select"
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
                <div className="game-text text-xs text-gray-300">Click + Enter</div>
              </div>
              <div className="text-center">
                <div className="game-text text-red-400 text-sm">Player 2</div>
                <div className="game-text text-xs text-gray-300">Click + Enter</div>
              </div>
            </div>
          )}
          
          {/* Instructions moved here for better visibility */}
          <div className="text-center mt-4">
            <div className="game-text text-lg text-yellow-300 font-bold">
              {getInstructionText()}
            </div>
          </div>
        </div>

        {/* Fighter Grid with Side Panels */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="flex items-center justify-center w-full max-w-6xl">
            {/* Left Panel - Player 1 Info */}
            <div className="w-64 flex-shrink-0 mr-8">
              {isMultiplayer && selectedPlayer1 ? (
                <div className="text-center game-text bg-black/70 rounded p-4 character-info-panel">
                  <div className="game-title mb-2 text-blue-400 font-bold">
                    {fighters.find(f => f.id === selectedPlayer1)?.name}
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    {fighters.find(f => f.id === selectedPlayer1)?.description}
                  </div>
                  <div className="text-xs text-orange-400 font-bold">
                    Special: {fighters.find(f => f.id === selectedPlayer1)?.specialMove}
                  </div>
                </div>
              ) : !isMultiplayer && selectedFighter ? (
                <div className="text-center game-text bg-black/70 rounded p-4 character-info-panel">
                  <div className="game-title mb-2 text-white font-bold">{selectedFighter.name}</div>
                  <div className="text-sm text-gray-300 mb-2">{selectedFighter.description}</div>
                  <div className="text-xs text-orange-400 font-bold">Special: {selectedFighter.specialMove}</div>
                </div>
              ) : !isMultiplayer ? null : (
                <div className="text-center game-text bg-black/30 rounded p-4 text-gray-500">
                  <div className="text-sm">Выберите персонажа</div>
                </div>
              )}
            </div>

            {/* Center - Fighter Grid */}
            <div className="grid grid-cols-3 grid-rows-2 gap-x-12 gap-y-12">
              {fighters.map((fighter, index) => (
                <div
                  key={fighter.id}
                  className={`relative w-20 h-20 cursor-pointer flex flex-col justify-end m-2 ${getCharacterBorder(index)}`}
                  onClick={() => handleCharacterClick(index)}
                  onMouseEnter={handleCharacterHover}
                >
                  <Image
                    src={fighter.portrait || "/placeholder.svg"}
                    alt={fighter.name}
                    width={80}
                    height={80}
                    className="pixelated w-full h-full object-cover rounded"
                  />
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black/80 text-center text-xs py-1 px-2 game-text text-white rounded pointer-events-none flex items-center justify-center" style={{minHeight: '1.5em'}}>
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

            {/* Right Panel - Player 2 Info */}
            <div className="w-64 flex-shrink-0 ml-8">
              {isMultiplayer && selectedPlayer2 ? (
                <div className="text-center game-text bg-black/70 rounded p-4 character-info-panel">
                  <div className="game-title mb-2 text-red-400 font-bold">
                    {fighters.find(f => f.id === selectedPlayer2)?.name}
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    {fighters.find(f => f.id === selectedPlayer2)?.description}
                  </div>
                  <div className="text-xs text-orange-400 font-bold">
                    Special: {fighters.find(f => f.id === selectedPlayer2)?.specialMove}
                  </div>
                </div>
              ) : isMultiplayer ? (
                <div className="text-center game-text bg-black/30 rounded p-4 text-gray-500">
                  <div className="text-sm">Игрок 2</div>
                  <div className="text-xs mt-1">Ожидание выбора</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
