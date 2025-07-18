export interface Fighter {
  id: string
  name: string
  description: string
  portrait: string
  sprite: string
  punchSprite?: string
  kickSprite?: string
  duckSprite?: string
  jumpSprite?: string
  jumpKickSprite?: string
  defenceSprite?: string
  walkSprite?: string
  lostSprite?: string
  wonSprite?: string
  hitSprite?: string
  useSingleSprite?: boolean
  specialMove: string
}

export const fighters: Fighter[] = [
  {
    id: "bernar",
    name: "Bernar",
    description: "🔥 ULTIMATE BOSS 🔥 The legendary DevOps master with unstoppable power!",
    portrait: "/images/fighters/bernar.png",
    sprite: "/images/fighters/thegeorg_stand.png",
    punchSprite: "/images/fighters/thegeorg_punch.png",
    kickSprite: "/images/fighters/thegeorg_kick.png",
    duckSprite: "/images/fighters/thegeorg_duck.png",
    jumpSprite: "/images/fighters/thegeorg_jump.png",
    defenceSprite: "/images/fighters/thegeorg_defence.png",
    walkSprite: "/images/fighters/thegeorg_walk.png",
    lostSprite: "/images/fighters/thegeorg_lost.png",
    wonSprite: "/images/fighters/thegeorg_won.png",
    hitSprite: "/images/fighters/thegeorg_gotpunched.png",
    useSingleSprite: true,
    specialMove: "💀 ULTIMATE DESTRUCTION COMBO 💀",
  },
  {
    id: "aliqhan",
    name: "Alikhan",
    description: "The iOS fighter with AppStore strikes",
    portrait: "/images/fighters/aliqhan.png",
    sprite: "/images/fighters/dave-radau-stand.png",
    punchSprite: "/images/fighters/dave-radau-punch.png",
    kickSprite: "/images/fighters/daveradau_kick.png",
    duckSprite: "/images/fighters/daveradau_duck.png",
    jumpSprite: "/images/fighters/daveradau_jump.png",
    defenceSprite: "/images/fighters/daveradau_defence.png",
    walkSprite: "/images/fighters/daveradau_walk.png",
    lostSprite: "/images/fighters/dave-radau-lost.png",
    wonSprite: "/images/fighters/dave-radau-won.png",
    hitSprite: "/images/fighters/daveradau_gotpunched.png",
    useSingleSprite: true,
    specialMove: "Sonic Shades",
  },
  {
    id: "shoqan",
    name: "Shoqan",
    description: "The Frontender with a stoic bodyshape",
    portrait: "/images/fighters/shoqan.png",
    sprite: "/images/fighters/jensator-stand.png",
    punchSprite: "/images/fighters/jensator-punch.png",
    kickSprite: "/images/fighters/jensator-kick.png",
    duckSprite: "/images/fighters/jensator-duck.png",
    jumpSprite: "/images/fighters/jensator-jump.png",
    defenceSprite: "/images/fighters/jensator_defence.png",
    walkSprite: "/images/fighters/jensator_walk.png",
    lostSprite: "/images/fighters/jensator-lost.png",
    wonSprite: "/images/fighters/jensator-won.png",
    hitSprite: "/images/fighters/jensator_gotpunched.png",
    useSingleSprite: true,
    specialMove: "Cap Crusher",
  },
  {
    id: "bakhredin",
    name: "Bakhredin",
    description: "The Wrestler with unpredictable moves",
    portrait: "/images/fighters/bakhredin.png",
    sprite: "/images/fighters/justusjonas_stand.png",
    punchSprite: "/images/fighters/justusjonas_punch.png",
    kickSprite: "/images/fighters/justusjonas_kick.png",
    duckSprite: "/images/fighters/justusjonas_duck.png",
    jumpSprite: "/images/fighters/justusjonas_jump.png",
    defenceSprite: "/images/fighters/justusjonas_defence.png",
    walkSprite: "/images/fighters/justusjonas_walk.png",
    lostSprite: "/images/fighters/justusjonas_lost.png",
    wonSprite: "/images/fighters/justusjonas_won.png",
    hitSprite: "/images/fighters/justusjonas_gotpunched.png",
    useSingleSprite: true,
    specialMove: "Three Question Combo",
  },
  {
    id: "arman",
    name: "Armansu",
    description: "Be So Good They Cannot Ignore You",
    portrait: "/images/fighters/arman.png",
    sprite: "/images/fighters/paddy_stand.png",
    punchSprite: "/images/fighters/paddy_punch.png",
    kickSprite: "/images/fighters/paddy_kick.png",
    duckSprite: "/images/fighters/paddy_duck.png",
    jumpSprite: "/images/fighters/paddy_jump.png",
    defenceSprite: "/images/fighters/paddy_defence.png",
    walkSprite: "/images/fighters/paddy_walk.png",
    lostSprite: "/images/fighters/paddy_lost.png",
    wonSprite: "/images/fighters/paddy_won.png",
    hitSprite: "/images/fighters/paddy_gotpunched.png",
    useSingleSprite: true,
    specialMove: "Code Review Devastation",
  },
  {
    id: "diana",
    name: "Diana",
    description: "The Coordinator with a good heart",
    portrait: "/images/fighters/diana.png",
    sprite: "/images/fighters/nicorohstahl_stand.png",
    punchSprite: "/images/fighters/nicorohstahl_punch.png",
    kickSprite: "/images/fighters/nicorohstahl_kick.png",
    duckSprite: "/images/fighters/nicorohstahl_duck.png",
    jumpSprite: "/images/fighters/nicorohstahl_jump.png",
    defenceSprite: "/images/fighters/nicorohstahl_defence.png",
    walkSprite: "/images/fighters/nicorohstahl_walk.png",
    lostSprite: "/images/fighters/nicorohstahl_lost.png",
    wonSprite: "/images/fighters/nicorohstahl_won.png",
    hitSprite: "/images/fighters/nicorohstahl_gotpunched.png",
    useSingleSprite: true,
    specialMove: "Lightning Legs",
  },
]
