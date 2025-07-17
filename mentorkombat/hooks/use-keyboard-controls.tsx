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
    s: false,
    d: false,
    
    // Player 2 controls (WASD + QWE)
    w: false,
    W: false,
    q: false,
    Q: false,
    e: false,
    E: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.key)) {
        setKeys((prev) => ({ ...prev, [e.key]: true }))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.key)) {
        setKeys((prev) => ({ ...prev, [e.key]: false }))
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
    kick: keys.a,
    defence: keys.s,
    punch: keys.d,
  }

  const player2Controls = {
    up: keys.w || keys.W,
    down: keys.s, // Note: s is shared but context-dependent
    left: keys.a, // Note: a is shared but context-dependent  
    right: keys.d, // Note: d is shared but context-dependent
    kick: keys.q || keys.Q,
    defence: keys.w || keys.W, // Different mapping for P2
    punch: keys.e || keys.E,
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
  const player1Controls = {
    up: keys.ArrowUp,
    down: keys.ArrowDown,
    left: keys.ArrowLeft,
    right: keys.ArrowRight,
    kick: keys.j,
    defence: keys.k,
    punch: keys.l,
  }

  const player2Controls = {
    up: keys.w,
    down: keys.s,
    left: keys.a,
    right: keys.d,
    kick: keys.q,
    defence: keys.e,
    punch: keys.r,
  }

  return {
    isKeyDown: keys,
    resetKeys,
    player1: player1Controls,
    player2: player2Controls,
  }
}
