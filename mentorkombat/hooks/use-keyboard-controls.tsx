"use client"

import { useState, useEffect, useCallback } from "react"

export function useKeyboardControls() {
  const [keys, setKeys] = useState<Record<string, boolean>>({
    // Player 1 controls (Arrow keys + ASD)
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    a: false,
    A: false,
    s: false,
    S: false,
    d: false,
    D: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (keys.hasOwnProperty(key) || keys.hasOwnProperty(e.key)) {
        setKeys((prev) => ({ ...prev, [key]: true, [e.key]: true }))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (keys.hasOwnProperty(key) || keys.hasOwnProperty(e.key)) {
        setKeys((prev) => ({ ...prev, [key]: false, [e.key]: false }))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [keys])

  const resetKeys = useCallback((keysToReset: string[]) => {
    setKeys((prev) => {
      const newKeys = { ...prev }
      keysToReset.forEach((key) => {
        if (newKeys.hasOwnProperty(key)) {
          newKeys[key] = false
        }
      })
      return newKeys
    })
  }, [])

  // Separate player controls for easier access
  const player1Controls = {
    up: keys.ArrowUp,
    down: keys.ArrowDown,
    left: keys.ArrowLeft,
    right: keys.ArrowRight,
    kick: keys.a || keys.A,
    defence: keys.s || keys.S,
    punch: keys.d || keys.D,
  }

  const player2Controls = {
    up: keys.ArrowUp,
    down: keys.ArrowDown,
    left: keys.ArrowLeft,
    right: keys.ArrowRight,
    kick: keys.a || keys.A,
    defence: keys.s || keys.S,
    punch: keys.d || keys.D,
  }

  return {
    isKeyDown: keys,
    resetKeys,
    player1: player1Controls,
    player2: player2Controls,
  }
}

// New hook specifically for multiplayer with non-conflicting keys
export function useMultiplayerKeyboardControls() {
  const [keys, setKeys] = useState<Record<string, boolean>>({
    // Player 1 controls (Arrow keys + J,K,L)
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    j: false, // kick
    k: false, // defence  
    l: false, // punch
    
    // Player 2 controls (WASD + Q,E,R)
    w: false, // up
    a: false, // left
    s: false, // down
    d: false, // right
    q: false, // kick
    e: false, // defence
    r: false, // punch
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (keys.hasOwnProperty(key) || keys.hasOwnProperty(e.key)) {
        setKeys((prev) => ({ ...prev, [key]: true, [e.key]: true }))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (keys.hasOwnProperty(key) || keys.hasOwnProperty(e.key)) {
        setKeys((prev) => ({ ...prev, [key]: false, [e.key]: false }))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [keys])

  const resetKeys = useCallback((keysToReset: string[]) => {
    setKeys((prev) => {
      const newKeys = { ...prev }
      keysToReset.forEach((key) => {
        if (newKeys.hasOwnProperty(key)) {
          newKeys[key] = false
        }
      })
      return newKeys
    })
  }, [])

  // Clean player controls without conflicts
  // Player 1 (левый) играет на WASD
  const player1Controls = {
    up: keys.w,
    down: keys.s,
    left: keys.a,
    right: keys.d,
    kick: keys.q,
    defence: keys.e,
    punch: keys.r,
  }

  // Player 2 (правый) играет на стрелках
  const player2Controls = {
    up: keys.ArrowUp,
    down: keys.ArrowDown,
    left: keys.ArrowLeft,
    right: keys.ArrowRight,
    kick: keys.j,
    defence: keys.k,
    punch: keys.l,
  }

  return {
    isKeyDown: keys,
    resetKeys,
    player1: player1Controls,
    player2: player2Controls,
  }
}
