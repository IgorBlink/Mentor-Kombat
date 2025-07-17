"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function IntroScreen() {
  const router = useRouter()
  const [showStart, setShowStart] = useState(true)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        router.push(`/select`)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

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
      <div className={`game-text red-blood text-[4rem] text-center font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20`}>
        n! Mentor Kombat
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <div className="flex-1 flex items-end justify-center pb-8">
          <div className={`game-text text-white text-2xl ${showStart ? "blink" : ""}`}>
            Press ENTER to Start
          </div>
        </div>
      </div>
    </div>
  )
}
