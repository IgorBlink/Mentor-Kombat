"use client"

import { useSoundContext } from "./sound-context"
import Image from "next/image"

export function MuteButton() {
  const { isMuted, toggleMute } = useSoundContext()

  return (
    <button
      onClick={toggleMute}
      style={{ background: 'rgba(0,0,0,0.7)' }}
      className="fixed top-4 left-4 z-50 mute-bg border-2 border-white shadow-lg p-3 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
      aria-label={isMuted ? "Unmute" : "Mute"}
    >
      <Image
        src={isMuted ? "/images/icons/volume_off_24dp_E3E3E3.png" : "/images/icons/volume_up_24dp_E3E3E3.png"}
        alt={isMuted ? "Unmute" : "Mute"}
        width={32}
        height={32}
        className=""
      />
    </button>
  )
}
