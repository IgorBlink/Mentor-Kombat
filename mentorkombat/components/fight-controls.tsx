export function FightControls() {
  return (
    <div className="bg-black/90 w-full py-2 px-4 flex justify-center gap-4 text-xs game-text mb-2 fight-controls">
      <div>← → : Move</div>
      <div>↑ : Jump</div>
      <div>↓ : Duck</div>
      <div>A : Kick</div>
      <div>S : Defence</div>
      <div>D : Punch</div>
      <div>↑+A : Jump Kick</div>
    </div>
  )
}
