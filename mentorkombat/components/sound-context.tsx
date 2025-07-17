"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type SoundContextType = {
  isMuted: boolean
  toggleMute: () => void
  playSound: (soundPath: string) => void
  playVoice: (voicePath: string) => void
  startBackgroundMusic: () => void
}

const SoundContext = createContext<SoundContextType>({
  isMuted: false,
  toggleMute: () => {},
  playSound: () => {},
  playVoice: () => {},
  startBackgroundMusic: () => {},
})

export const useSoundContext = () => useContext(SoundContext)

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [musicStarted, setMusicStarted] = useState(false)

  useEffect(() => {
    // Create audio element
    const audioElement = new Audio("/sounds/background-music.mp3")
    audioElement.loop = true
    setAudio(audioElement)

    // Clean up on unmount
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ""
      }
    }
  }, [])

  useEffect(() => {
    if (!audio || !musicStarted) return

    if (isMuted) {
      audio.pause()
    } else {
      audio.play().catch((error) => {
        console.log("Background music playback failed:", error)
      })
    }
  }, [audio, isMuted, musicStarted])

  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  const playSound = (soundPath: string) => {
    if (isMuted) return
    
    const soundEffect = new Audio(soundPath)
    soundEffect.volume = 0.7
    soundEffect.play().catch((error) => {
      console.log("Sound effect playback failed:", error)
    })
  }

  const playVoice = (voicePath: string) => {
    if (isMuted) return
    
    const voiceEffect = new Audio(voicePath)
    voiceEffect.volume = 0.8
    voiceEffect.play().catch((error) => {
      console.log("Voice effect playback failed:", error)
    })
  }

  const startBackgroundMusic = () => {
    if (!audio || musicStarted) return
    
    setMusicStarted(true)
    if (!isMuted) {
      audio.play().catch((error) => {
        console.log("Background music playback failed:", error)
      })
    }
  }

  return <SoundContext.Provider value={{ isMuted, toggleMute, playSound, playVoice, startBackgroundMusic }}>{children}</SoundContext.Provider>
}
