"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type SoundCategory = 'combat' | 'ui' | 'voice' | 'music' | 'ambient'

interface SoundConfig {
  volume?: number
  category?: SoundCategory
  loop?: boolean
  fadeIn?: number
  fadeOut?: number
}

type SoundContextType = {
  isMuted: boolean
  toggleMute: () => void
  playSound: (soundPath: string, config?: SoundConfig) => void
  playVoice: (voicePath: string) => void
  startBackgroundMusic: () => void
  stopBackgroundMusic: () => void
  playComboSounds: (sounds: string[], delays?: number[]) => void
  preloadSounds: (soundPaths: string[]) => Promise<void>
}

const SoundContext = createContext<SoundContextType>({
  isMuted: false,
  toggleMute: () => {},
  playSound: () => {},
  playVoice: () => {},
  startBackgroundMusic: () => {},
  stopBackgroundMusic: () => {},
  playComboSounds: () => {},
  preloadSounds: async () => {},
})

export const useSoundContext = () => useContext(SoundContext)

// Audio cache to prevent recreating Audio objects
const audioCache = new Map<string, HTMLAudioElement>()

// Function to create audio with better error handling
const createAudioElement = (soundPath: string): HTMLAudioElement | null => {
  try {
    const audio = new Audio()
    
    // Set properties before setting src to avoid immediate loading issues
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous'
    
    // Add comprehensive error handling
    audio.addEventListener('error', (e) => {
      const target = e.target as HTMLAudioElement
      const errorCode = target.error?.code
      const errorMessage = target.error?.message || 'Unknown error'
      
      console.error('Audio creation error for:', soundPath, {
        errorCode,
        errorMessage,
        networkState: target.networkState,
        readyState: target.readyState,
        src: target.src
      })
    }, { once: true })
    
    // Add load success handler for debugging
    audio.addEventListener('loadeddata', () => {
      console.log('Audio loaded successfully:', soundPath)
    }, { once: true })
    
    // Set src after event listeners are attached
    audio.src = soundPath
    
    return audio
  } catch (error) {
    console.error('Failed to create audio element for:', soundPath, error)
    return null
  }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [musicStarted, setMusicStarted] = useState(false)
  const [audioSupported, setAudioSupported] = useState(true)

  // Fallback background music options
  const backgroundMusicOptions = [
    "/sounds/mk_3yc8v8r.mp3",
    // background-music.mp3 removed - file not found
    "/sounds/mixkit-video-game-win-2016.wav", // Fallback 2
    "/sounds/mixkit-player-losing-or-failing-2042.wav"   // Fallback 3
  ]

  const createBackgroundMusic = async (musicPaths: string[]): Promise<HTMLAudioElement | null> => {
    for (const musicPath of musicPaths) {
      try {
        const audioElement = new Audio()
        audioElement.preload = 'auto'
        audioElement.crossOrigin = 'anonymous'
        audioElement.loop = true
        audioElement.volume = 0.3
        
        // Create a promise to handle loading
        const loadPromise = new Promise<HTMLAudioElement>((resolve, reject) => {
          const handleLoad = () => {
            console.log('Background music loaded successfully:', musicPath)
            audioElement.removeEventListener('error', handleError)
            audioElement.removeEventListener('canplaythrough', handleLoad)
            resolve(audioElement)
          }
          
          const handleError = (e: Event) => {
            const target = e.target as HTMLAudioElement
            const errorCode = target.error?.code
            const errorMessage = target.error?.message || 'Unknown error'
            
            console.warn('Background music loading failed for:', musicPath, {
              errorCode,
              errorMessage,
              networkState: target.networkState,
              readyState: target.readyState
            })
            
            audioElement.removeEventListener('error', handleError)
            audioElement.removeEventListener('canplaythrough', handleLoad)
            reject(new Error(`Failed to load ${musicPath}`))
          }
          
          audioElement.addEventListener('canplaythrough', handleLoad, { once: true })
          audioElement.addEventListener('error', handleError, { once: true })
          
          // Set timeout to avoid hanging
          setTimeout(() => {
            audioElement.removeEventListener('error', handleError)
            audioElement.removeEventListener('canplaythrough', handleLoad)
            reject(new Error(`Timeout loading ${musicPath}`))
          }, 5000)
        })
        
        audioElement.src = musicPath
        
        // Wait for the audio to load or fail
        await loadPromise
        return audioElement
        
      } catch (error) {
        console.warn(`Failed to create background music with ${musicPath}:`, error)
        continue // Try next option
      }
    }
    
    console.warn('All background music options failed to load')
    return null
  }

  useEffect(() => {
    // Check if audio is supported
    try {
      const testAudio = new Audio()
      if (typeof testAudio.play !== 'function') {
        setAudioSupported(false)
        return
      }
    } catch (error) {
      console.warn('Audio not supported in this browser:', error)
      setAudioSupported(false)
      return
    }

    // Create background music with fallback options
    let audioElement: HTMLAudioElement | null = null
    
    createBackgroundMusic(backgroundMusicOptions)
      .then((element) => {
        if (element) {
          audioElement = element
          setAudio(element)
        } else {
          console.warn('No background music could be loaded, continuing without background music')
        }
      })
      .catch((error) => {
        console.error('Error setting up background music:', error)
      })

    // Clean up on unmount
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ""
      }
      // Clear audio cache
      audioCache.clear()
    }
  }, [])

  useEffect(() => {
    if (!audio || !musicStarted || !audioSupported) return

    if (isMuted) {
      audio.pause()
    } else {
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Background music playback failed:", error)
        })
      }
    }
  }, [audio, isMuted, musicStarted, audioSupported])

  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  const playSound = (soundPath: string, config: SoundConfig = {}) => {
    if (isMuted || !audioSupported) return
    
    try {
      // Check if audio is already cached
      let soundEffect = audioCache.get(soundPath)
      
      if (!soundEffect) {
        soundEffect = createAudioElement(soundPath)
        if (!soundEffect) {
          console.warn('Could not create audio for:', soundPath)
          return
        }
        audioCache.set(soundPath, soundEffect)
      } else {
        // Reset the audio to beginning for reuse
        soundEffect.currentTime = 0
      }
      
      // Apply configuration
      const defaultVolume = config.category === 'combat' ? 0.8 : 
                           config.category === 'ui' ? 0.6 : 
                           config.category === 'ambient' ? 0.4 : 0.7
      soundEffect.volume = config.volume ?? defaultVolume
      soundEffect.loop = config.loop ?? false
      
      // Handle loading errors with detailed information
      soundEffect.addEventListener('error', (e) => {
        const target = e.target as HTMLAudioElement
        const errorCode = target.error?.code
        const errorMessage = target.error?.message || 'Unknown error'
        
        console.error('Audio loading error for:', soundPath, {
          errorCode,
          errorMessage,
          networkState: target.networkState,
          readyState: target.readyState,
          src: target.src,
          event: e
        })
        
        // Remove from cache if it fails
        audioCache.delete(soundPath)
        
        // Try alternative approach - create new audio element
        setTimeout(() => {
          try {
            const retryAudio = new Audio()
            retryAudio.src = soundPath
            retryAudio.volume = 0.7
            retryAudio.play().catch(retryError => {
              console.warn('Retry audio playback also failed for:', soundPath, retryError)
            })
          } catch (retryError) {
            console.warn('Could not retry audio for:', soundPath, retryError)
          }
        }, 100)
      }, { once: true })
      
      // Wait for audio to be ready before playing
      const playAudio = () => {
        const playPromise = soundEffect!.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn("Sound effect playback failed:", error, 'for file:', soundPath)
            // Try to reload the audio file
            audioCache.delete(soundPath)
          })
        }
      }
      
      if (soundEffect.readyState >= 2) {
        // Audio is already loaded
        playAudio()
      } else {
        // Wait for audio to load
        soundEffect.addEventListener('canplaythrough', playAudio, { once: true })
        soundEffect.load()
      }
      
    } catch (error) {
      console.error('Error in playSound:', error, 'for file:', soundPath)
    }
  }

  const playVoice = (voicePath: string) => {
    if (isMuted || !audioSupported) return
    
    try {
      // Check if audio is already cached
      let voiceEffect = audioCache.get(voicePath)
      
      if (!voiceEffect) {
        voiceEffect = createAudioElement(voicePath)
        if (!voiceEffect) {
          console.warn('Could not create audio for:', voicePath)
          return
        }
        audioCache.set(voicePath, voiceEffect)
      } else {
        // Reset the audio to beginning for reuse
        voiceEffect.currentTime = 0
      }
      
      voiceEffect.volume = 0.8
      
      // Handle loading errors with detailed information
      voiceEffect.addEventListener('error', (e) => {
        const target = e.target as HTMLAudioElement
        const errorCode = target.error?.code
        const errorMessage = target.error?.message || 'Unknown error'
        
        console.error('Voice loading error for:', voicePath, {
          errorCode,
          errorMessage,
          networkState: target.networkState,
          readyState: target.readyState,
          src: target.src,
          event: e
        })
        
        // Remove from cache if it fails
        audioCache.delete(voicePath)
        
        // Try alternative approach - create new audio element
        setTimeout(() => {
          try {
            const retryAudio = new Audio()
            retryAudio.src = voicePath
            retryAudio.volume = 0.8
            retryAudio.play().catch(retryError => {
              console.warn('Retry voice playback also failed for:', voicePath, retryError)
            })
          } catch (retryError) {
            console.warn('Could not retry voice for:', voicePath, retryError)
          }
        }, 100)
      }, { once: true })
      
      // Wait for audio to be ready before playing
      const playAudio = () => {
        const playPromise = voiceEffect!.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn("Voice effect playback failed:", error, 'for file:', voicePath)
            // Try to reload the audio file
            audioCache.delete(voicePath)
          })
        }
      }
      
      if (voiceEffect.readyState >= 2) {
        // Audio is already loaded
        playAudio()
      } else {
        // Wait for audio to load
        voiceEffect.addEventListener('canplaythrough', playAudio, { once: true })
        voiceEffect.load()
      }
      
    } catch (error) {
      console.error('Error in playVoice:', error, 'for file:', voicePath)
    }
  }

  const startBackgroundMusic = () => {
    if (!audio || musicStarted || !audioSupported) return
    
    setMusicStarted(true)
    if (!isMuted) {
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          if (error.name === 'NotAllowedError') {
            console.log("Background music requires user interaction first. Music will start after user clicks or presses a key.")
          } else {
            console.log("Background music playback failed:", error)
          }
        })
      }
    }
  }

  const stopBackgroundMusic = () => {
    if (!audio || !audioSupported) return
    
    audio.pause()
    audio.currentTime = 0
    setMusicStarted(false)
  }

  const playComboSounds = (sounds: string[], delays: number[] = []) => {
    if (isMuted || !audioSupported) return
    
    sounds.forEach((sound, index) => {
      const delay = delays[index] || index * 100 // Default 100ms between sounds
      setTimeout(() => {
        playSound(sound, { category: 'combat' })
      }, delay)
    })
  }

  const preloadSounds = async (soundPaths: string[]): Promise<void> => {
    if (!audioSupported) return
    
    const loadPromises = soundPaths.map(async (soundPath) => {
      try {
        if (!audioCache.has(soundPath)) {
          const audio = createAudioElement(soundPath)
          if (audio) {
            // Wait for the audio to be ready
            await new Promise<void>((resolve, reject) => {
              const handleLoad = () => {
                audio.removeEventListener('canplaythrough', handleLoad)
                audio.removeEventListener('error', handleError)
                audioCache.set(soundPath, audio)
                resolve()
              }
              
              const handleError = () => {
                audio.removeEventListener('canplaythrough', handleLoad)
                audio.removeEventListener('error', handleError)
                console.warn('Failed to preload sound:', soundPath)
                resolve() // Don't reject, just continue
              }
              
              audio.addEventListener('canplaythrough', handleLoad, { once: true })
              audio.addEventListener('error', handleError, { once: true })
              
              // Timeout after 5 seconds
              setTimeout(() => {
                audio.removeEventListener('canplaythrough', handleLoad)
                audio.removeEventListener('error', handleError)
                resolve()
              }, 5000)
            })
          }
        }
      } catch (error) {
        console.warn('Error preloading sound:', soundPath, error)
      }
    })
    
    await Promise.all(loadPromises)
    console.log('Preloaded', soundPaths.length, 'sounds')
  }

  return (
    <SoundContext.Provider 
      value={{ 
        isMuted, 
        toggleMute, 
        playSound: audioSupported ? playSound : () => {}, 
        playVoice: audioSupported ? playVoice : () => {}, 
        startBackgroundMusic: audioSupported ? startBackgroundMusic : () => {},
        stopBackgroundMusic: audioSupported ? stopBackgroundMusic : () => {},
        playComboSounds: audioSupported ? playComboSounds : () => {},
        preloadSounds: audioSupported ? preloadSounds : async () => {}
      }}
    >
      {children}
    </SoundContext.Provider>
  )
}
