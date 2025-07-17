"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { fighters } from "@/lib/fighters"

export default function CharacterSelect() {
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          setSelectedIndex((prev) => (prev + 1) % fighters.length)
          break
        case "ArrowLeft":
          setSelectedIndex((prev) => (prev - 1 + fighters.length) % fighters.length)
          break
        case "ArrowUp":
          setSelectedIndex((prev) => {
            // For a 3x2 grid (6 fighters)
            if (prev < 3) {
              return prev + 3
            }
            return prev - 3
          })
          break
        case "ArrowDown":
          setSelectedIndex((prev) => {
            // For a 3x2 grid (6 fighters)
            if (prev >= 3) {
              return prev - 3
            }
            return prev + 3
          })
          break
        case "Enter":
          // Initialize with empty previous opponents
          router.push(`/fight?player=${fighters[selectedIndex].id}&round=1&difficulty=1.0&prevOpponents=`)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, router])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[#001428] pixelated">
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Main container - compact layout */}
      <div className="relative z-10 h-screen flex flex-col justify-between py-2">
        {/* Header */}
        <div className="flex-shrink-0">
          <h2 className="game-title text-2xl text-center brightness-125">Select Your Fighter</h2>
        </div>

        {/* Fighter Grid */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-3 grid-rows-2 gap-x-4 gap-y-4 max-w-2xl">
            {fighters.map((fighter, index) => (
              <div
                key={fighter.id}
                className={`relative w-20 h-20 cursor-pointer ${
                  selectedIndex === index 
                    ? "ring-2 ring-orange-500 scale-110 transform transition-all duration-300" 
                    : "transition-all duration-300 hover:scale-105"
                }`}
                onClick={() => {
                  setSelectedIndex(index)
                }}
              >
                <Image
                  src={fighter.portrait || "/placeholder.svg"}
                  alt={fighter.name}
                  width={80}
                  height={80}
                  className="pixelated w-full h-full object-cover rounded"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-center text-xs py-1 game-text text-white rounded-b">
                  {fighter.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Fighter Info */}
        <div className="flex-shrink-0 px-4">
          <div className="max-w-xl mx-auto text-center game-text">
            <div className="text-lg mb-1 text-white font-bold">{fighters[selectedIndex].name}</div>
            <div className="text-xs mb-1 text-gray-300">{fighters[selectedIndex].description}</div>
            <div className="text-xs mb-2 text-orange-400 font-bold">Special: {fighters[selectedIndex].specialMove}</div>
            <div className="text-xs text-gray-400">Press ENTER to fight | Use arrow keys to navigate</div>
          </div>
        </div>
      </div>
    </div>
  )
}
