export function MultiplayerFightControls() {
  return (
    <div className="bg-black/90 w-full py-2 px-4 flex justify-center gap-6 text-xs game-text mb-2 fight-controls">
      <div className="text-blue-400">
        <div className="font-bold mb-1">Player 1 (Left)</div>
        <div className="flex gap-3">
          <div>A D : Move</div>
          <div>W : Jump</div>
          <div>S : Duck</div>
          <div>Q : Kick</div>
          <div>E : Defence</div>
          <div>R : Punch</div>
        </div>
      </div>
      <div className="text-red-400">
        <div className="font-bold mb-1">Player 2 (Right)</div>
        <div className="flex gap-3">
          <div>← → : Move</div>
          <div>↑ : Jump</div>
          <div>↓ : Duck</div>
          <div>J : Kick</div>
          <div>K : Defence</div>
          <div>L : Punch</div>
        </div>
      </div>
    </div>
  )
}