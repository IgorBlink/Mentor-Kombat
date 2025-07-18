const stageBackgrounds = ["/images/stages/bgarena.png", "/images/stages/bgarena2.png"]

// Function to get a deterministic stage background based on fighter IDs
export function getStageBackground(playerId: string, opponentId: string): string {
  // Create a simple hash from fighter IDs to ensure consistent selection
  const combined = playerId + opponentId
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % stageBackgrounds.length
  return stageBackgrounds[index]
}

// Legacy function for backward compatibility - now uses first stage
export function getRandomStageBackground(): string {
  return stageBackgrounds[0]
}
