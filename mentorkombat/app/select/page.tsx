"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { fighters } from "@/lib/fighters"
import { Component as Lightning } from "@/components/ui/lightning";

export default function CharacterSelect() {
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showStart, setShowStart] = useState(true)

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

  useEffect(() => {
    const interval = setInterval(() => {
      setShowStart((prev) => !prev)
    }, 700)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Lightning background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Lightning hue={220} speed={0.7} intensity={1.2} size={1.5} />
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
                className={`relative w-20 h-20 cursor-pointer flex flex-col justify-end ${
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
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-center text-xs py-1 game-text text-white rounded-b pointer-events-none flex items-center justify-center" style={{minHeight: '1.5em'}}>
                  {fighter.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Fighter Info */}
        <div className="flex-shrink-0 px-4">
          <div
            className="max-w-xl mx-auto text-center game-text bg-black/70 rounded p-2"
            style={{
              maxHeight: "22vh", // ограничение по высоте
              overflowY: "auto", // прокрутка если не помещается
              minHeight: "80px",
              lineHeight: "1.7",
            }}
          >
            <div className="game-title mb-1 text-white font-bold break-words ">{fighters[selectedIndex].name}</div>
            <div className="text-xs mb-1 text-gray-300 break-words">{fighters[selectedIndex].description}</div>
            <div className="text-xs mb-2 text-orange-400 font-bold break-words">Special: {fighters[selectedIndex].specialMove}</div>
            <div className={`text-xs text-white break-words ${showStart ? "blink" : ""}`}>Press ENTER to fight | Use arrow keys to navigate</div>
          </div>
        </div>
      </div>
    </div>
  )
}
