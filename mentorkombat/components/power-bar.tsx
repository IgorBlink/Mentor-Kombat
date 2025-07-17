interface PowerBarProps {
  health: number
  name: string
  reversed?: boolean
}

export function PowerBar({ health, name, reversed = false }: PowerBarProps) {
  return (
    <div className={`flex flex-col ${reversed ? "items-end" : "items-start"} w-1/3`}>
      <div className="game-text mb-0.5 text-xs">{name}</div>
      <div className="power-bar w-full h-4">
        <div
          className="power-bar-fill h-full"
          style={{
            width: `${health}%`,
            float: reversed ? "right" : "left",
          }}
        />
      </div>
    </div>
  )
}
