"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { fighters } from "@/lib/fighters"
import { useKeyboardControls, useMultiplayerKeyboardControls } from "@/hooks/use-keyboard-controls"
import { FightControls } from "@/components/fight-controls"
import { MultiplayerFightControls } from "@/components/multiplayer-fight-controls"
import { PowerBar } from "@/components/power-bar"
import { Fighter } from "@/components/fighter"
import { getRandomFighter } from "@/lib/game-utils"
import { getStageBackground } from "@/lib/stage-utils"
import { useSoundContext } from "@/components/sound-context"

export default function FightScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if multiplayer mode
  const gameMode = searchParams.get("mode") || "single"
  const isMultiplayer = gameMode === "multiplayer"
  
  // Get fighter IDs based on mode
  const playerId = searchParams.get("player") || searchParams.get("player1") || fighters[0].id
  const player2Id = searchParams.get("player2") || ""
  const playerFighter = fighters.find((f) => f.id === playerId) || fighters[0]
  
  // Get previous opponents from URL for single player
  const previousOpponentsParam = searchParams.get("prevOpponents") || ""
  const previousOpponents = previousOpponentsParam ? previousOpponentsParam.split(",") : []
  
  // Use useRef to store the CPU fighter so it doesn't change during the game
  const cpuFighterRef = useRef(getRandomFighter(playerId, previousOpponents))
  
  // CPU or Player 2 fighter
  const opponentFighter: typeof fighters[0] = isMultiplayer 
    ? fighters.find((f) => f.id === player2Id) || fighters[1]
    : cpuFighterRef.current

  // Get a deterministic stage background based on fighter IDs
  const stageBackground = getStageBackground(playerId, opponentFighter.id)

  const [playerHealth, setPlayerHealth] = useState(playerFighter.id === "bernar" ? 1 : 100)
  const [opponentHealth, setOpponentHealth] = useState(opponentFighter.id === "bernar" ? 1 : 100)
  const [playerPosition, setPlayerPosition] = useState(150) // 150px from left edge
  const [opponentPosition, setOpponentPosition] = useState(150) // 150px from right edge
  const [playerState, setPlayerState] = useState("idle")
  const [opponentState, setOpponentState] = useState("idle")
  const [playerJumpDirection, setPlayerJumpDirection] = useState<"left" | "right" | null>(null)
  const [opponentJumpDirection, setOpponentJumpDirection] = useState<"left" | "right" | null>(null)
  const [isPlayerDefending, setIsPlayerDefending] = useState(false)
  const [isOpponentDefending, setIsOpponentDefending] = useState(false)
  const [isPlayerFacingLeft, setIsPlayerFacingLeft] = useState(false)
  const [isOpponentFacingLeft, setIsOpponentFacingLeft] = useState(true) // Start facing left (towards player)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<"player" | "opponent" | null>(null)

  // Single player specific state
  const roundCount = Number.parseInt(searchParams.get("round") || "1", 10)
  const difficulty = Number.parseFloat(searchParams.get("difficulty") || "1.0")

  // Add state for tracking when fighters are hit
  const [isPlayerHit, setIsPlayerHit] = useState(false)
  const [isOpponentHit, setIsOpponentHit] = useState(false)

  // Add state for walking animation
  const [isPlayerWalking, setIsPlayerWalking] = useState(false)
  const [isOpponentWalking, setIsOpponentWalking] = useState(false)

  // Add state to track if jump key was just pressed
  const [jumpKeyPressed, setJumpKeyPressed] = useState(false)
  const [p2JumpKeyPressed, setP2JumpKeyPressed] = useState(false)

  // Add state for jump kicking
  const [isPlayerJumpKicking, setIsPlayerJumpKicking] = useState(false)
  const [isOpponentJumpKicking, setIsOpponentJumpKicking] = useState(false)

  // CPU-specific state (only for single player)
  const [playerLastAction, setPlayerLastAction] = useState<
    "idle" | "punch" | "kick" | "jump" | "duck" | "defence" | "jumpKick"
  >("idle")
  // const [cpuMovementTimer, setCpuMovementTimer] = useState(0) // Unused variable
  const [cpuIdleTime, setCpuIdleTime] = useState(0)
  const [cpuAttackCooldown, setCpuAttackCooldown] = useState(false)

  // Track key press for single tap movement
  const [arrowLeftPressed, setArrowLeftPressed] = useState(false)
  const [arrowRightPressed, setArrowRightPressed] = useState(false)
  const [p2LeftPressed, setP2LeftPressed] = useState(false)
  const [p2RightPressed, setP2RightPressed] = useState(false)

  const gameLoopRef = useRef<number | null>(null)
  const cpuMovementRef = useRef<number | null>(null)
  const lastCpuActionRef = useRef(Date.now())
  const movementIntervalRef = useRef<number | null>(null)
  const p2MovementIntervalRef = useRef<number | null>(null)
  const hitCooldownRef = useRef(false)

  // Set up keyboard controls based on mode
  const singlePlayerControls = useKeyboardControls()
  const multiplayerControls = useMultiplayerKeyboardControls()
  
  const controls = isMultiplayer ? multiplayerControls : singlePlayerControls
  const { resetKeys } = controls

  // Sound context for playing sound effects
  const { playSound, playVoice } = useSoundContext()

  // Play fight voice at the start of the battle
  useEffect(() => {
    const timer = setTimeout(() => {
      playVoice("/sounds/fight_voice.m4a")
    }, 1000) // Play after 1 second delay

    return () => clearTimeout(timer)
  }, [playVoice])

  // Random voice commands during fight
  useEffect(() => {
    if (gameOver) return

    const voiceCommands = [
      "/sounds/codenow_voice.m4a",
      "/sounds/deadlineapproaches_voice.m4a",
      "/sounds/MergeConflict_voice.m4a",
      "/sounds/LinterError_voice.m4a",
      "/sounds/CIFailed_voice.m4a",
      "/sounds/DeployOrDie_voice.m4a"
    ]

    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        const randomVoice = voiceCommands[Math.floor(Math.random() * voiceCommands.length)]
        playVoice(randomVoice)
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [gameOver, playVoice])

  // Calculate actual positions for hit detection - slightly reduced hit area
  const getPlayerCenterX = () => playerPosition + 70
  const getOpponentCenterX = () => window.innerWidth - opponentPosition - 70

  // Fighter collision detection - define collision boxes
  // const FIGHTER_WIDTH = 320
  // const PLAYER2_FIGHTER_WIDTH = 300
  
  // Отдельные размеры для проверки коллизий движения
  const MOVEMENT_COLLISION_WIDTH = 150
  const MOVEMENT_COLLISION_WIDTH_P2 = 140

  // Check if fighters are colliding
  // const checkCollision = () => {
  //   if (playerState === "jump" || opponentState === "jump") {
  //     return false
  //   }

  //   const playerRight = playerPosition + FIGHTER_WIDTH
  //   const opponentLeft = window.innerWidth - opponentPosition - PLAYER2_FIGHTER_WIDTH

  //   return playerRight >= opponentLeft
  // }

  const endGame = useCallback((winner: "player" | "opponent") => {
    console.log("endGame called with winner:", winner)
    
    // Prevent multiple calls
    if (gameOver) {
      console.log("Game already over, ignoring endGame call")
      return
    }
    
    // Immediately stop the game and clear all intervals
    setGameOver(true)
    setWinner(winner)
    
    // Clear all intervals and timeouts
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
      gameLoopRef.current = null
    }
    if (cpuMovementRef.current) {
      clearInterval(cpuMovementRef.current)
      cpuMovementRef.current = null
    }
    if (movementIntervalRef.current) {
      clearInterval(movementIntervalRef.current)
      movementIntervalRef.current = null
    }
    if (p2MovementIntervalRef.current) {
      clearInterval(p2MovementIntervalRef.current)
      p2MovementIntervalRef.current = null
    }

    // Play special voice commands based on game outcome
    if (winner === "player" && !isMultiplayer) {
      // Single player victory - play congratulations or demo day voice
      const victoryVoices = ["/sounds/CongratsYouHired_voice.m4a", "/sounds/DemoDay_voice.m4a"]
      const randomVictoryVoice = victoryVoices[Math.floor(Math.random() * victoryVoices.length)]
      setTimeout(() => playVoice(randomVictoryVoice), 1500)
    }

    // Navigate immediately using multiple methods
    const url = isMultiplayer 
      ? `/winner?mode=multiplayer&winner=${winner}&player=${playerId}&opponent=${opponentFighter.id}`
      : `/winner?winner=${winner}&player=${playerId}&opponent=${opponentFighter.id}&round=${roundCount}&difficulty=${difficulty.toFixed(1)}&prevOpponents=${previousOpponentsParam}`
    
    console.log("Navigation URL:", url)
    
    // Try router.push first
    try {
      console.log("Trying router.push...")
      router.push(url)
      console.log("Router.push called successfully")
    } catch (error) {
      console.error("Router.push failed:", error)
    }
    
    // Also use window.location as backup after a short delay
    setTimeout(() => {
      console.log("Using window.location.href as backup")
      window.location.href = url
    }, 500)
  }, [router, isMultiplayer, playerId, opponentFighter.id, roundCount, difficulty, previousOpponentsParam, playVoice, gameOver])

  // Handle single tap movement for player
  useEffect(() => {
    // Use correct controls based on mode
    const p1Controls = isMultiplayer ? multiplayerControls.player1 : {
      left: controls.isKeyDown.ArrowLeft,
      right: controls.isKeyDown.ArrowRight,
      up: controls.isKeyDown.ArrowUp,
      down: controls.isKeyDown.ArrowDown,
      punch: controls.isKeyDown.d || controls.isKeyDown.D,
      kick: controls.isKeyDown.a || controls.isKeyDown.A,
      defence: controls.isKeyDown.s || controls.isKeyDown.S,
    }
    
    // Handle single tap for left arrow
    if (
      p1Controls.left &&
      !arrowLeftPressed &&
      playerState !== "jump" &&
      playerState !== "defence" &&
      playerState !== "duck"
    ) {
      setArrowLeftPressed(true)
      setIsPlayerFacingLeft(true)
      // Set walking animation when moving
      setIsPlayerWalking(true)

      // Calculate new position
      const newPosition = Math.max(playerPosition - 20, 50)

      // Check if this movement would cause collision (используем меньшие размеры для движения)
      const playerRight = newPosition + MOVEMENT_COLLISION_WIDTH
      const opponentLeft = window.innerWidth - opponentPosition - MOVEMENT_COLLISION_WIDTH_P2

      // Only move if it won't cause collision
      if (playerState === "jump" || playerRight < opponentLeft) {
        setPlayerPosition(newPosition)
      }
    }
    if (!p1Controls.left && arrowLeftPressed) {
      setArrowLeftPressed(false)
      // Stop walking animation if both movement keys are up
      if (!p1Controls.right) setIsPlayerWalking(false)
    }

    // Handle single tap for right arrow
    if (
      p1Controls.right &&
      !arrowRightPressed &&
      playerState !== "jump" &&
      playerState !== "defence" &&
      playerState !== "duck"
    ) {
      setArrowRightPressed(true)
      setIsPlayerFacingLeft(false)
      // Set walking animation when moving
      setIsPlayerWalking(true)

      // Calculate new position
      const newPosition = Math.min(playerPosition + 20, window.innerWidth - 150)

      // Check if this movement would cause collision (используем меньшие размеры для движения)
      const playerRight = newPosition + MOVEMENT_COLLISION_WIDTH
      const opponentLeft = window.innerWidth - opponentPosition - MOVEMENT_COLLISION_WIDTH_P2

      // Only move if it won't cause collision
      if (playerState === "jump" || playerRight < opponentLeft) {
        setPlayerPosition(newPosition)
      }
    }
    if (!p1Controls.right && arrowRightPressed) {
      setArrowRightPressed(false)
      // Stop walking animation if both movement keys are up
      if (!p1Controls.left) setIsPlayerWalking(false)
    }
  }, [
    controls.isKeyDown.ArrowLeft,
    controls.isKeyDown.ArrowRight,
    controls.isKeyDown.ArrowUp,
    controls.isKeyDown.ArrowDown,
    controls.isKeyDown.A,
    controls.isKeyDown.D,
    controls.isKeyDown.S,
    controls.isKeyDown.a,
    controls.isKeyDown.d,
    controls.isKeyDown.s,
    arrowLeftPressed,
    arrowRightPressed,
    playerState,
    playerPosition,
    opponentPosition,
    isMultiplayer,
    multiplayerControls.player1,
  ])

  // CPU movement logic - separate from main game loop for more frequent movement
  useEffect(() => {
    if (gameOver || isMultiplayer) return // Skip CPU AI in multiplayer mode

    // CPU movement loop - runs more frequently than the main game loop
    cpuMovementRef.current = window.setInterval(() => {
      // Don't move if CPU is in the middle of an action
      if (opponentState !== "idle") return

      // Get positions for calculations
      const opponentCenterX = getOpponentCenterX()
      const playerCenterX = getPlayerCenterX()

      // Always update CPU facing direction based on player position
      // CPU should face left when player is to the left
      setIsOpponentFacingLeft(opponentCenterX < playerCenterX)

      // Check if player is nearby for attack
              const isPlayerNearby = Math.abs(opponentCenterX - playerCenterX) < 450

      // If player is nearby and not on cooldown, attempt to attack
      if (isPlayerNearby && !cpuAttackCooldown && opponentState === "idle") {
        const attackChance = Math.random()

        if (attackChance < 0.6) {
          // 60% chance to attack when close
          setCpuAttackCooldown(true)
          // Stop walking animation during attack
          setIsOpponentWalking(false)

          // Choose attack type
          if (attackChance < 0.3) {
            // Punch
            setOpponentState("punch")
            playSound("/sounds/punch.mp3")

            // Check if hit - CANNOT hit jumping player with punch
            // If player is defending, they take reduced damage (1%)
            if (
              Math.abs(opponentCenterX - playerCenterX) < 400 &&
              playerState !== "jump" &&
              !hitCooldownRef.current &&
              // CPU must be facing the player to hit
              ((opponentCenterX < playerCenterX && isOpponentFacingLeft) || (opponentCenterX > playerCenterX && !isOpponentFacingLeft))
            ) {
              // If player is defending, they take reduced damage (1%)
              if (playerState === "defence") {
                setPlayerHealth((prev) => {
                  const newHealth = Math.max(0, prev - 1)
                  if (newHealth <= 0) {
                    setTimeout(() => endGame("opponent"), 100)
                  } else if (newHealth <= 20 && Math.random() < 0.5) {
                    // Play tension voice when player health is low
                    playVoice("/sounds/deadlineapproaches_voice.m4a")
                  }
                  return newHealth
                }) // 1% damage when defending
                // Don't set isPlayerHit when defending - keep defense sprite
              } else {
                // Apply difficulty multiplier to damage
                const damageMultiplier = difficulty
                setPlayerHealth((prev) => {
                  const newHealth = Math.max(0, prev - Math.round(5 * damageMultiplier))
                  if (newHealth <= 0) {
                    setTimeout(() => endGame("opponent"), 100)
                  } else if (newHealth <= 20 && Math.random() < 0.5) {
                    // Play tension voice when player health is low
                    playVoice("/sounds/deadlineapproaches_voice.m4a")
                  }
                  return newHealth
                }) // Scaled damage
                setIsPlayerHit(true)
                playSound("/sounds/hit.mp3")
                setTimeout(() => setIsPlayerHit(false), 300)
              }

              hitCooldownRef.current = true
              setTimeout(() => {
                hitCooldownRef.current = false
              }, 500)
            }

            setTimeout(() => {
              setOpponentState("idle")
              setTimeout(() => setCpuAttackCooldown(false), 300) // Short cooldown after attack
            }, 300)
          } else if (attackChance < 0.5) {
            // Kick
            setOpponentState("kick")
            playSound("/sounds/kick.mp3")

            // Check if hit - CANNOT hit ducking player with kick
            // If player is defending, they take reduced damage (1%)
            if (
              Math.abs(opponentCenterX - playerCenterX) < 450 &&
              playerState !== "jump" &&
              playerState !== "duck" && // Added check for ducking
              !hitCooldownRef.current &&
              // CPU must be facing the player to hit
              ((opponentCenterX < playerCenterX && isOpponentFacingLeft) || (opponentCenterX > playerCenterX && !isOpponentFacingLeft))
            ) {
              // If player is defending, they take reduced damage (1%)
              if (playerState === "defence") {
                setPlayerHealth((prev) => {
                  const newHealth = Math.max(0, prev - 1)
                  if (newHealth <= 0) {
                    setTimeout(() => endGame("opponent"), 100)
                  } else if (newHealth <= 20 && Math.random() < 0.5) {
                    // Play tension voice when player health is low
                    playVoice("/sounds/deadlineapproaches_voice.m4a")
                  }
                  return newHealth
                }) // 1% damage when defending
                // Don't set isPlayerHit when defending - keep defense sprite
              } else {
                // Apply difficulty multiplier to damage
                const damageMultiplier = difficulty
                setPlayerHealth((prev) => {
                  const newHealth = Math.max(0, prev - Math.round(10 * damageMultiplier))
                  if (newHealth <= 0) {
                    setTimeout(() => endGame("opponent"), 100)
                  } else if (newHealth <= 20 && Math.random() < 0.5) {
                    // Play tension voice when player health is low
                    playVoice("/sounds/deadlineapproaches_voice.m4a")
                  }
                  return newHealth
                }) // Scaled damage
                setIsPlayerHit(true)
                playSound("/sounds/hit.mp3")
                setTimeout(() => setIsPlayerHit(false), 300)
              }

              hitCooldownRef.current = true
              setTimeout(() => {
                hitCooldownRef.current = false
              }, 500)
            }

            setTimeout(() => {
              setOpponentState("idle")
              setTimeout(() => setCpuAttackCooldown(false), 400) // Medium cooldown after attack
            }, 400)
          } else {
            // Defence - CPU occasionally defends
            setOpponentState("defence")
            setTimeout(() => {
              setOpponentState("idle")
              setTimeout(() => setCpuAttackCooldown(false), 500)
            }, 500)
          }

          // Reset idle time when attacking
          setCpuIdleTime(0)
          return
        }
      }

      // Increment idle time counter
      setCpuIdleTime((prev) => prev + 1)

      // If CPU has been idle for too long, force movement
      if (cpuIdleTime > 3) {
        // Reduced from 5 to 3 to make CPU move more
        // Move towards player
        setOpponentPosition((prev) => {
          const direction = opponentCenterX > playerCenterX ? 1 : -1
          // Set walking animation when moving
          setIsOpponentWalking(true)

          // Calculate new position
          const newPosition = Math.max(50, Math.min(window.innerWidth - 150, prev + direction * 15))

          // Check if this movement would cause collision (используем меньшие размеры для движения)
          const playerRight = playerPosition + MOVEMENT_COLLISION_WIDTH
          const opponentLeft = window.innerWidth - newPosition - MOVEMENT_COLLISION_WIDTH_P2

          // Only move if it won't cause collision
          if (playerRight < opponentLeft) {
            return newPosition
          }
          return prev
        })

        // Reset idle time
        setCpuIdleTime(0)
        return
      }

      // Random movement chance (higher probability - increased from 0.3 to 0.5)
      if (Math.random() < 0.5) {
        // Move towards player
        setOpponentPosition((prev) => {
          const direction = opponentCenterX > playerCenterX ? 1 : -1
          // Set walking animation when moving
          setIsOpponentWalking(true)

          // Calculate new position
          const newPosition = Math.max(50, Math.min(window.innerWidth - 150, prev + direction * 15))

          // Check if this movement would cause collision (используем меньшие размеры для движения)
          const playerRight = playerPosition + MOVEMENT_COLLISION_WIDTH
          const opponentLeft = window.innerWidth - newPosition - MOVEMENT_COLLISION_WIDTH_P2

          // Only move if it won't cause collision
          if (playerRight < opponentLeft) {
            return newPosition
          }
          return prev
        })

        // Reset idle time when moving
        setCpuIdleTime(0)
      } else {
        // Stop walking animation when not moving
        setIsOpponentWalking(false)
      }

      // Random duck or jump (lower probability)
      if (Math.random() < 0.1 && opponentState === "idle") {
        // Stop walking animation during action
        setIsOpponentWalking(false)

        if (Math.random() < 0.5) {
          setOpponentState("duck")
          setTimeout(() => setOpponentState("idle"), 400)
        } else {
          setOpponentState("jump")
          playSound("/sounds/jump.mp3")
          setTimeout(() => setOpponentState("idle"), 500)
        }
        // Reset idle time when performing an action
        setCpuIdleTime(0)
      }

      // Increment movement timer
      // setCpuMovementTimer((prev) => prev + 1) // Commented out as cpuMovementTimer is unused
    }, 200) // Check for movement every 200ms

    return () => {
      if (cpuMovementRef.current) clearInterval(cpuMovementRef.current)
    }
  }, [
    opponentState,
    cpuIdleTime,
    gameOver,
    playerState,
    playerHealth,
    cpuAttackCooldown,
    playerPosition,
    opponentPosition,
    isOpponentFacingLeft,
    difficulty,
    isMultiplayer,
    endGame,
    getOpponentCenterX,
    getPlayerCenterX,
    playSound,
    playVoice,
  ])

  // Game loop for CPU AI decisions
  useEffect(() => {
    if (gameOver) return

    // CPU AI
    gameLoopRef.current = window.setInterval(() => {
      // Adjust reaction time based on difficulty (faster reactions at higher difficulty)
      const reactionTime = Math.max(500 - (difficulty - 1) * 100, 200)
      if (Date.now() - lastCpuActionRef.current < reactionTime) return

      // Regular CPU actions
      const action = Math.random()

      // Update CPU facing direction based on player position
      const opponentCenterX = getOpponentCenterX()
      const playerCenterX = getPlayerCenterX()

      // CPU should face left when player is to the left
      setIsOpponentFacingLeft(opponentCenterX < playerCenterX)

      // React to player's last action
      if (playerLastAction === "kick" && opponentState === "idle" && action < 0.7) {
        // Stop walking animation during action
        setIsOpponentWalking(false)

        // Duck to dodge kicks
        setOpponentState("duck")
        setTimeout(() => setOpponentState("idle"), 400)
        lastCpuActionRef.current = Date.now()
        setCpuIdleTime(0) // Reset idle time
        return
      }

      if (playerLastAction === "punch" && opponentState === "idle" && action < 0.7) {
        // Stop walking animation during action
        setIsOpponentWalking(false)

        // Jump to dodge punches
        setOpponentState("jump")
        playSound("/sounds/jump.mp3")
        setTimeout(() => setOpponentState("idle"), 500)
        lastCpuActionRef.current = Date.now()
        setCpuIdleTime(0) // Reset idle time
        return
      }

      // Sometimes use defence when player is attacking
      if ((playerLastAction === "punch" || playerLastAction === "kick") && opponentState === "idle" && action < 0.4) {
        // Stop walking animation during action
        setIsOpponentWalking(false)

        setOpponentState("defence")
        setTimeout(() => setOpponentState("idle"), 500)
        lastCpuActionRef.current = Date.now()
        setCpuIdleTime(0) // Reset idle time
        return
      }

      lastCpuActionRef.current = Date.now()
    }, 500) // Faster AI thinking

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
      if (movementIntervalRef.current) clearInterval(movementIntervalRef.current)
    }
  }, [
    playerPosition,
    opponentPosition,
    playerState,
    opponentState,
    playerHealth,
    opponentHealth,
    gameOver,
    playerLastAction,
    difficulty,
    getOpponentCenterX,
    getPlayerCenterX,
    playSound,
  ])

  // Handle continuous movement when keys are held down for player
  useEffect(() => {
    if (gameOver) return

    // Use correct controls based on mode
    const p1Controls = isMultiplayer ? multiplayerControls.player1 : {
      left: controls.isKeyDown.ArrowLeft,
      right: controls.isKeyDown.ArrowRight,
      up: controls.isKeyDown.ArrowUp,
      down: controls.isKeyDown.ArrowDown,
      punch: controls.isKeyDown.d || controls.isKeyDown.D,
      kick: controls.isKeyDown.a || controls.isKeyDown.A,
      defence: controls.isKeyDown.s || controls.isKeyDown.S,
    }

    // Clear any existing movement interval
    if (movementIntervalRef.current) {
      clearInterval(movementIntervalRef.current)
      movementIntervalRef.current = null
    }

    // Handle movement and direction
    if ((p1Controls.right || p1Controls.left) && playerState !== "duck") {
      // Set walking animation when moving
      if (playerState === "idle") setIsPlayerWalking(true)

      // Set up continuous movement
      movementIntervalRef.current = window.setInterval(() => {
        if (p1Controls.right && playerState !== "jump" && playerState !== "defence" && playerState !== "duck") {
          // Calculate new position
          const newPosition = Math.min(playerPosition + 10, window.innerWidth - 150)

          // Check if this movement would cause collision (используем меньшие размеры для движения)
          const playerRight = newPosition + MOVEMENT_COLLISION_WIDTH
          const opponentLeft = window.innerWidth - opponentPosition - MOVEMENT_COLLISION_WIDTH_P2

          // Only move if it won't cause collision
          if (playerRight < opponentLeft) {
            setPlayerPosition(newPosition)
          }
        } else if (
          p1Controls.left &&
          playerState !== "jump" &&
          playerState !== "defence" &&
          playerState !== "duck"
        ) {
          setPlayerPosition((prev) => Math.max(prev - 10, 50))
        }
      }, 50) // Move every 50ms for smoother continuous movement
    } else {
      // Stop walking animation when not moving
      setIsPlayerWalking(false)
    }

    return () => {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current)
        movementIntervalRef.current = null
      }
    }
  }, [
    controls.isKeyDown.ArrowRight, 
    controls.isKeyDown.ArrowLeft, 
    controls.isKeyDown.ArrowUp,
    controls.isKeyDown.ArrowDown,
    controls.isKeyDown.A,
    controls.isKeyDown.D,
    controls.isKeyDown.S,
    controls.isKeyDown.a,
    controls.isKeyDown.d,
    controls.isKeyDown.s,
    gameOver, 
    playerState, 
    playerPosition, 
    opponentPosition,
    isMultiplayer,
    multiplayerControls.player1
  ])

  // Handle jump with direction - only jump once per key press
  useEffect(() => {
    if (gameOver) return

    // Use correct controls based on mode
    const p1Controls = isMultiplayer ? multiplayerControls.player1 : {
      left: controls.isKeyDown.ArrowLeft,
      right: controls.isKeyDown.ArrowRight,
      up: controls.isKeyDown.ArrowUp,
      down: controls.isKeyDown.ArrowDown,
      punch: controls.isKeyDown.d || controls.isKeyDown.D,
      kick: controls.isKeyDown.a || controls.isKeyDown.A,
      defence: controls.isKeyDown.s || controls.isKeyDown.S,
    }

    // Handle jump key press
    if (p1Controls.up && playerState === "idle" && !jumpKeyPressed) {
      setJumpKeyPressed(true)
      setPlayerLastAction("jump")
      // Stop walking animation during jump
      setIsPlayerWalking(false)

      // Determine jump direction
      let direction: "left" | "right" | null = null

      if (p1Controls.left) {
        direction = "left"
        setIsPlayerFacingLeft(true)
        // Move left while jumping
        setPlayerPosition((prev) => Math.max(prev - 50, 50))
      } else if (p1Controls.right) {
        direction = "right"
        setIsPlayerFacingLeft(false)
        // Move right while jumping
        setPlayerPosition((prev) => Math.min(prev + 50, window.innerWidth - 150))
      }

      setPlayerJumpDirection(direction)
      setPlayerState("jump")
      playSound("/sounds/jump.mp3")

      setTimeout(() => {
        setPlayerState("idle")
        setPlayerJumpDirection(null)
        setPlayerLastAction("idle")
        setIsPlayerJumpKicking(false)
      }, 500)
    }

    // Reset jump key pressed state when key is released
    if (!p1Controls.up && jumpKeyPressed) {
      setJumpKeyPressed(false)
    }

    if (p1Controls.down && playerState === "idle") {
      setPlayerState("duck")
      setPlayerLastAction("duck")
      // Stop walking animation during duck
      setIsPlayerWalking(false)
    } else if (!p1Controls.down && playerState === "duck") {
      setPlayerState("idle")
      setPlayerLastAction("idle")
    }

    if (p1Controls.punch && playerState === "idle") {
      setPlayerState("punch")
      setPlayerLastAction("punch")
      playSound("/sounds/punch.mp3")
      // Stop walking animation during punch
      setIsPlayerWalking(false)

      // Check if hit - improved hit detection with slightly reduced area
      const opponentCenterX = getOpponentCenterX()
      const playerCenterX = getPlayerCenterX()

      // Only allow hits when player is close to CPU and facing the right direction
      if (
        Math.abs(opponentCenterX - playerCenterX) < 400 && // Увеличено для лучшего попадания
        opponentState !== "jump" && // Can't hit jumping CPU (dodge)
        !hitCooldownRef.current &&
        // Player must be facing the CPU to hit
        ((playerCenterX < opponentCenterX && !isPlayerFacingLeft) || (playerCenterX > opponentCenterX && isPlayerFacingLeft))
      ) {
        // If CPU is defending, they take reduced damage (1%)
        if (opponentState === "defence") {
          setOpponentHealth((prev) => {
            const newHealth = Math.max(0, prev - 1)
            if (newHealth <= 0) {
              setTimeout(() => endGame("player"), 100)
            }
            return newHealth
          })
          // Don't set isCpuHit when defending - keep defense sprite
        } else {
          setOpponentHealth((prev) => {
            const newHealth = Math.max(0, prev - 5)
            if (newHealth <= 0) {
              setTimeout(() => endGame("player"), 100)
            }
            return newHealth
          })
          setIsOpponentHit(true)
          playSound("/sounds/hit.mp3")
          setTimeout(() => setIsOpponentHit(false), 300)
        }

        hitCooldownRef.current = true
        setTimeout(() => {
          hitCooldownRef.current = false
        }, 500)
      }

      setTimeout(() => {
        setPlayerState("idle")
        setPlayerLastAction("idle")
      }, 300)
      if (isMultiplayer) {
        resetKeys(["l"])
      } else {
        resetKeys(["d", "D"])
      }
    }

    // Handle kick - now works both on ground and in air
    if (p1Controls.kick && (playerState === "idle" || playerState === "jump")) {
      // If in air, do a jump kick, otherwise do a regular kick
      const isJumpKick = playerState === "jump"

      if (isJumpKick) {
        setPlayerLastAction("jumpKick")
        setIsPlayerJumpKicking(true)
      } else {
        setPlayerState("kick")
        setPlayerLastAction("kick")
        playSound("/sounds/kick.mp3")
        // Stop walking animation during kick
        setIsPlayerWalking(false)
      }

      // Check if hit - improved hit detection with slightly reduced area
      const opponentCenterX = getOpponentCenterX()
      const playerCenterX = getPlayerCenterX()

      // Only allow hits when player is close to CPU and facing the right direction
      if (
        Math.abs(opponentCenterX - playerCenterX) < 450 && // Увеличено для лучшего попадания (kick)
        opponentState !== "jump" && // Can't hit jumping CPU
        (isJumpKick || opponentState !== "duck") && // Regular kick can't hit ducking CPU, but jump kick can
        !hitCooldownRef.current &&
        // Player must be facing the CPU to hit
        ((playerCenterX < opponentCenterX && !isPlayerFacingLeft) || (playerCenterX > opponentCenterX && isPlayerFacingLeft))
      ) {
        // If CPU is defending, they take reduced damage (1%)
        if (opponentState === "defence") {
          setOpponentHealth((prev) => {
            const newHealth = Math.max(0, prev - 1)
            if (newHealth <= 0) {
              setTimeout(() => endGame("player"), 100)
            }
            return newHealth
          })
          // Don't set isCpuHit when defending - keep defense sprite
        } else {
          // Jump kicks do more damage
          const damage = isJumpKick ? 15 : 10
          setOpponentHealth((prev) => {
            const newHealth = Math.max(0, prev - damage)
            if (newHealth <= 0) {
              setTimeout(() => endGame("player"), 100)
            }
            return newHealth
          })
          setIsOpponentHit(true)
          playSound("/sounds/hit.mp3")
          setTimeout(() => setIsOpponentHit(false), 300)
        }

        hitCooldownRef.current = true
        setTimeout(() => {
          hitCooldownRef.current = false
        }, 500)
      }

      if (!isJumpKick) {
        setTimeout(() => {
          setPlayerState("idle")
          setPlayerLastAction("idle")
        }, 400)
      }
      if (isMultiplayer) {
        resetKeys(["j"])
      } else {
        resetKeys(["a", "A"])
      }
    }

    // Handle defence
    if (p1Controls.defence && playerState === "idle") {
      setPlayerState("defence")
      setPlayerLastAction("defence")
      setIsPlayerDefending(true)
      // Stop walking animation during defence
      setIsPlayerWalking(false)

      setTimeout(() => {
        setPlayerState("idle")
        setPlayerLastAction("idle")
        setIsPlayerDefending(false)
      }, 500)
      if (isMultiplayer) {
        resetKeys(["k"])
      } else {
        resetKeys(["s", "S"])
      }
    }
  }, [
    controls.isKeyDown.ArrowUp,
    controls.isKeyDown.ArrowDown,
    controls.isKeyDown.ArrowLeft,
    controls.isKeyDown.ArrowRight,
    controls.isKeyDown.d,
    controls.isKeyDown.D,
    controls.isKeyDown.a,
    controls.isKeyDown.A,
    controls.isKeyDown.s,
    controls.isKeyDown.S,
    playerPosition,
    opponentPosition,
    playerState,
    opponentState,
    playerHealth,
    opponentHealth,
    gameOver,
    resetKeys,
    jumpKeyPressed,
    isPlayerFacingLeft,
    isMultiplayer,
    multiplayerControls.player1,
  ])

  // Multiplayer Player 2 controls
  useEffect(() => {
    if (gameOver || !isMultiplayer) return

    const p2Controls = multiplayerControls.player2

    // Handle single tap movement for player 2
    if (
      p2Controls.left &&
      !p2LeftPressed &&
      opponentState !== "jump" &&
      opponentState !== "defence" &&
      opponentState !== "duck"
    ) {
      setP2LeftPressed(true)
      setIsOpponentFacingLeft(false) // P2 faces left when moving left
      setIsOpponentWalking(true)

      const newPosition = Math.min(opponentPosition + 20, window.innerWidth - 150)
      
      // Check collision
      const playerRight = playerPosition + MOVEMENT_COLLISION_WIDTH
      const opponentLeft = window.innerWidth - newPosition - MOVEMENT_COLLISION_WIDTH_P2

      if (opponentState === "jump" || playerRight < opponentLeft) {
        setOpponentPosition(newPosition)
      }
    }
    if (!p2Controls.left && p2LeftPressed) {
      setP2LeftPressed(false)
      if (!p2Controls.right) setIsOpponentWalking(false)
    }

    // Handle single tap for right arrow
    if (
      p2Controls.right &&
      !p2RightPressed &&
      opponentState !== "jump" &&
      opponentState !== "defence" &&
      opponentState !== "duck"
    ) {
      setP2RightPressed(true)
      setIsOpponentFacingLeft(true) // P2 faces right when moving right
      setIsOpponentWalking(true)

      const newPosition = Math.max(opponentPosition - 20, 50)
      
      // Check collision
      const playerRight = playerPosition + MOVEMENT_COLLISION_WIDTH
      const opponentLeft = window.innerWidth - newPosition - MOVEMENT_COLLISION_WIDTH_P2

      if (opponentState === "jump" || playerRight < opponentLeft) {
        setOpponentPosition(newPosition)
      }
    }
    if (!p2Controls.right && p2RightPressed) {
      setP2RightPressed(false)
      if (!p2Controls.left) setIsOpponentWalking(false)
    }
  }, [
    multiplayerControls.player2.left,
    multiplayerControls.player2.right,
    p2LeftPressed,
    p2RightPressed,
    opponentState,
    opponentPosition,
    playerPosition,
    gameOver,
    isMultiplayer,
  ])

  // Multiplayer Player 2 continuous movement
  useEffect(() => {
    if (gameOver || !isMultiplayer) return

    const p2Controls = multiplayerControls.player2

    if (p2MovementIntervalRef.current) {
      clearInterval(p2MovementIntervalRef.current)
      p2MovementIntervalRef.current = null
    }

    if ((p2Controls.right || p2Controls.left) && opponentState !== "duck") {
      if (opponentState === "idle") setIsOpponentWalking(true)

      p2MovementIntervalRef.current = window.setInterval(() => {
        if (p2Controls.right && opponentState !== "jump" && opponentState !== "defence" && opponentState !== "duck") {
          setOpponentPosition((prev) => Math.max(prev - 10, 50))
        } else if (p2Controls.left && opponentState !== "jump" && opponentState !== "defence" && opponentState !== "duck") {
          const newPosition = Math.min(opponentPosition + 10, window.innerWidth - 150)
          
          const playerRight = playerPosition + MOVEMENT_COLLISION_WIDTH
          const opponentLeft = window.innerWidth - newPosition - MOVEMENT_COLLISION_WIDTH_P2

          if (playerRight < opponentLeft) {
            setOpponentPosition(newPosition)
          }
        }
      }, 50)
    } else {
      setIsOpponentWalking(false)
    }

    return () => {
      if (p2MovementIntervalRef.current) {
        clearInterval(p2MovementIntervalRef.current)
        p2MovementIntervalRef.current = null
      }
    }
  }, [multiplayerControls.player2.right, multiplayerControls.player2.left, gameOver, opponentState, opponentPosition, playerPosition, isMultiplayer])

  // Multiplayer Player 2 actions
  useEffect(() => {
    if (gameOver || !isMultiplayer) return

    const p2Controls = multiplayerControls.player2

    // Handle jump
    if (p2Controls.up && opponentState === "idle" && !p2JumpKeyPressed) {
      setP2JumpKeyPressed(true)
      setIsOpponentWalking(false)

      let direction: "left" | "right" | null = null
      if (p2Controls.left) {
        direction = "left"
        setIsOpponentFacingLeft(false)
        setOpponentPosition((prev) => Math.min(prev + 50, window.innerWidth - 150))
      } else if (p2Controls.right) {
        direction = "right"
        setIsOpponentFacingLeft(true)
        setOpponentPosition((prev) => Math.max(prev - 50, 50))
      }

      setOpponentJumpDirection(direction)
      setOpponentState("jump")
      playSound("/sounds/jump.mp3")

      setTimeout(() => {
        setOpponentState("idle")
        setOpponentJumpDirection(null)
        setIsOpponentJumpKicking(false)
      }, 500)
    }

    if (!p2Controls.up && p2JumpKeyPressed) {
      setP2JumpKeyPressed(false)
    }

    // Handle duck
    if (p2Controls.down && opponentState === "idle") {
      setOpponentState("duck")
      setIsOpponentWalking(false)
    } else if (!p2Controls.down && opponentState === "duck") {
      setOpponentState("idle")
    }

    // Handle punch
    if (p2Controls.punch && opponentState === "idle") {
      setOpponentState("punch")
      playSound("/sounds/punch.mp3")
      setIsOpponentWalking(false)

      // Check if hit
      const opponentCenterX = getOpponentCenterX()
      const playerCenterX = getPlayerCenterX()

      if (
        Math.abs(opponentCenterX - playerCenterX) < 400 &&
        playerState !== "jump" &&
        !hitCooldownRef.current &&
        ((opponentCenterX < playerCenterX && isOpponentFacingLeft) || (opponentCenterX > playerCenterX && !isOpponentFacingLeft))
      ) {
        if (playerState === "defence") {
          setPlayerHealth((prev) => {
            const newHealth = Math.max(0, prev - 1)
            if (newHealth <= 0) {
              setTimeout(() => endGame("opponent"), 100)
            }
            return newHealth
          })
        } else {
          setPlayerHealth((prev) => {
            const newHealth = Math.max(0, prev - 5)
            if (newHealth <= 0) {
              setTimeout(() => endGame("opponent"), 100)
            }
            return newHealth
          })
          setIsPlayerHit(true)
          playSound("/sounds/hit.mp3")
          setTimeout(() => setIsPlayerHit(false), 300)
        }

        hitCooldownRef.current = true
        setTimeout(() => {
          hitCooldownRef.current = false
        }, 500)
      }

      setTimeout(() => {
        setOpponentState("idle")
      }, 300)
      resetKeys(["r"])
    }

    // Handle kick
    if (p2Controls.kick && (opponentState === "idle" || opponentState === "jump")) {
      const isJumpKick = opponentState === "jump"

      if (isJumpKick) {
        setIsOpponentJumpKicking(true)
      } else {
        setOpponentState("kick")
        playSound("/sounds/kick.mp3")
        setIsOpponentWalking(false)
      }

      // Check if hit
      const opponentCenterX = getOpponentCenterX()
      const playerCenterX = getPlayerCenterX()

      if (
        Math.abs(opponentCenterX - playerCenterX) < 450 &&
        playerState !== "jump" &&
        (isJumpKick || playerState !== "duck") &&
        !hitCooldownRef.current &&
        ((opponentCenterX < playerCenterX && isOpponentFacingLeft) || (opponentCenterX > playerCenterX && !isOpponentFacingLeft))
      ) {
        if (playerState === "defence") {
          setPlayerHealth((prev) => {
            const newHealth = Math.max(0, prev - 1)
            if (newHealth <= 0) {
              setTimeout(() => endGame("opponent"), 100)
            }
            return newHealth
          })
        } else {
          const damage = isJumpKick ? 15 : 10
          setPlayerHealth((prev) => {
            const newHealth = Math.max(0, prev - damage)
            if (newHealth <= 0) {
              setTimeout(() => endGame("opponent"), 100)
            }
            return newHealth
          })
          setIsPlayerHit(true)
          playSound("/sounds/hit.mp3")
          setTimeout(() => setIsPlayerHit(false), 300)
        }

        hitCooldownRef.current = true
        setTimeout(() => {
          hitCooldownRef.current = false
        }, 500)
      }

      if (!isJumpKick) {
        setTimeout(() => {
          setOpponentState("idle")
        }, 400)
      }
      resetKeys(["q"])
    }

    // Handle defence
    if (p2Controls.defence && opponentState === "idle") {
      setOpponentState("defence")
      setIsOpponentDefending(true)
      setIsOpponentWalking(false)

      setTimeout(() => {
        setOpponentState("idle")
        setIsOpponentDefending(false)
      }, 500)
      resetKeys(["e"])
    }
  }, [
    multiplayerControls.player2.up,
    multiplayerControls.player2.down,
    multiplayerControls.player2.left,
    multiplayerControls.player2.right,
    multiplayerControls.player2.punch,
    multiplayerControls.player2.kick,
    multiplayerControls.player2.defence,
    opponentPosition,
    playerPosition,
    opponentState,
    playerState,
    opponentHealth,
    playerHealth,
    gameOver,
    resetKeys,
    p2JumpKeyPressed,
    isOpponentFacingLeft,
    isMultiplayer,
    endGame,
    getOpponentCenterX,
    getPlayerCenterX,
    playSound,
  ])

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Image
          src={stageBackground || "/placeholder.svg"}
          alt="Fight Stage"
          fill
          className="object-cover pixelated"
          priority
        />
        <div className="absolute bottom-0 w-full h-16 bg-black/50"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Health bars */}
        <div className="flex-shrink-0 w-full px-4 pt-2 flex justify-between">
          <PowerBar health={playerHealth} name={playerFighter.name} />
          <PowerBar health={opponentHealth} name={opponentFighter.name} reversed />
        </div>

        {/* Fight area */}
        <div className="relative flex-1 w-full min-h-0">
          {/* Player fighter */}
          <Fighter
            fighter={playerFighter}
            position={playerPosition}
            state={playerState}
            side="left"
            jumpDirection={playerJumpDirection}
            isDefending={isPlayerDefending || playerState === "defence"}
            isFacingLeft={isPlayerFacingLeft}
            isDefeated={gameOver && winner === "opponent"}
            isVictorious={gameOver && winner === "player"}
            isHit={isPlayerHit}
            isWalking={isPlayerWalking && playerState === "idle"}
            isJumpKicking={isPlayerJumpKicking}
          />

          {/* Opponent fighter */}
          <Fighter
            fighter={opponentFighter}
            position={opponentPosition}
            state={opponentState}
            side="right"
            jumpDirection={opponentJumpDirection}
            isDefending={isOpponentDefending || opponentState === "defence"}
            isFacingLeft={isOpponentFacingLeft}
            isDefeated={gameOver && winner === "player"}
            isVictorious={gameOver && winner === "opponent"}
            isHit={isOpponentHit}
            isWalking={isOpponentWalking && opponentState === "idle"}
            isJumpKicking={isOpponentJumpKicking}
          />
        </div>

        {/* Controls help */}
        <div className="flex-shrink-0 pb-2">
          {isMultiplayer ? <MultiplayerFightControls /> : <FightControls />}
        </div>
      </div>
    </div>
  )
}
