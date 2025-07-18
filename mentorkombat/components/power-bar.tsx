interface PowerBarProps {
  health: number
  name: string
  reversed?: boolean
}

export function PowerBar({ health, name, reversed = false }: PowerBarProps) {
  // Show full health bar for Bernar to make him look like a boss
  const displayHealth = name === "Bernar" ? 100 : health
  const isBernar = name === "Bernar"
  
  // Pre-calculate display name to avoid hydration issues
  const displayName = isBernar ? `👑 ${name} 👑` : name
  const nameClassName = `game-text mb-0.5 text-xs${isBernar ? ' text-yellow-400 font-bold' : ''}`
  
  return (
    <div className={`flex flex-col ${reversed ? "items-end" : "items-start"} w-1/3`}>
      <div className={nameClassName}>
        {displayName}
      </div>
      <div className={`power-bar w-full h-4 ${isBernar ? 'border-2 border-yellow-400 shadow-lg shadow-yellow-400/50' : ''}`}>
        <div
          className={`h-full ${
            isBernar 
              ? 'bernar-health-bar'
              : 'power-bar-fill'
          }`}
          style={{
            width: `${displayHealth}%`,
            float: reversed ? "right" : "left"
          }}
        />
      </div>

    </div>
  )
}
