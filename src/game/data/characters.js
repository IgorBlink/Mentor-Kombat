// Character definitions for Mentor Kombat: nFactorial Edition

export const CHARACTERS = {
  MENTOR: {
    id: 'mentor',
    name: 'The Mentor',
    displayName: 'Senior Dev',
    description: 'Experienced teacher with powerful debugging skills',
    stats: {
      health: 120,
      attack: 85,
      defense: 90,
      speed: 60,
      specialPower: 95
    },
    colors: {
      primary: '#00ff41',
      secondary: '#0080ff',
      accent: '#ffffff'
    },
    sprite: {
      width: 64,
      height: 64,
      frameCount: 8,
      animations: {
        idle: { frames: [0, 1, 2, 3], speed: 0.1 },
        walk: { frames: [4, 5, 6, 7], speed: 0.2 },
        jump: { frames: [8, 9], speed: 0.15 },
        lightAttack: { frames: [10, 11, 12], speed: 0.3 },
        heavyAttack: { frames: [13, 14, 15, 16], speed: 0.25 },
        block: { frames: [17], speed: 0.1 },
        hit: { frames: [18, 19], speed: 0.4 },
        special: { frames: [20, 21, 22, 23, 24], speed: 0.2 }
      }
    },
    moves: {
      lightAttack: {
        damage: 15,
        startup: 5,
        active: 3,
        recovery: 8,
        hitbox: { x: 10, y: 20, width: 40, height: 20 }
      },
      heavyAttack: {
        damage: 25,
        startup: 12,
        active: 6,
        recovery: 15,
        hitbox: { x: 15, y: 15, width: 50, height: 30 }
      },
      special: {
        name: 'Code Review Slam',
        damage: 40,
        startup: 20,
        active: 10,
        recovery: 25,
        input: ['down', 'downforward', 'forward', 'punch'],
        hitbox: { x: 0, y: 10, width: 80, height: 40 }
      }
    },
    sounds: {
      attack: 'mentor_attack',
      hit: 'mentor_hit',
      special: 'mentor_special',
      victory: 'mentor_victory'
    }
  },

  STUDENT: {
    id: 'student',
    name: 'The Student',
    displayName: 'Junior Dev',
    description: 'Enthusiastic learner with lightning-fast reflexes',
    stats: {
      health: 100,
      attack: 75,
      defense: 60,
      speed: 95,
      specialPower: 80
    },
    colors: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      accent: '#ffffff'
    },
    sprite: {
      width: 64,
      height: 64,
      frameCount: 8,
      animations: {
        idle: { frames: [0, 1, 2, 3], speed: 0.15 },
        walk: { frames: [4, 5, 6, 7], speed: 0.25 },
        jump: { frames: [8, 9], speed: 0.2 },
        lightAttack: { frames: [10, 11, 12], speed: 0.35 },
        heavyAttack: { frames: [13, 14, 15, 16], speed: 0.3 },
        block: { frames: [17], speed: 0.1 },
        hit: { frames: [18, 19], speed: 0.4 },
        special: { frames: [20, 21, 22, 23], speed: 0.3 }
      }
    },
    moves: {
      lightAttack: {
        damage: 12,
        startup: 3,
        active: 2,
        recovery: 6,
        hitbox: { x: 8, y: 18, width: 35, height: 18 }
      },
      heavyAttack: {
        damage: 20,
        startup: 8,
        active: 4,
        recovery: 12,
        hitbox: { x: 12, y: 12, width: 45, height: 25 }
      },
      special: {
        name: 'Bug Fix Fury',
        damage: 35,
        startup: 15,
        active: 8,
        recovery: 18,
        input: ['quarter-circle-forward', 'punch'],
        hitbox: { x: 5, y: 8, width: 60, height: 35 }
      }
    },
    sounds: {
      attack: 'student_attack',
      hit: 'student_hit',
      special: 'student_special',
      victory: 'student_victory'
    }
  },

  MANAGER: {
    id: 'manager',
    name: 'The Manager',
    displayName: 'Project Lead',
    description: 'Balanced strategist with deadline pressure tactics',
    stats: {
      health: 110,
      attack: 80,
      defense: 75,
      speed: 75,
      specialPower: 90
    },
    colors: {
      primary: '#9c27b0',
      secondary: '#673ab7',
      accent: '#ffffff'
    },
    sprite: {
      width: 64,
      height: 64,
      frameCount: 8,
      animations: {
        idle: { frames: [0, 1, 2, 3], speed: 0.12 },
        walk: { frames: [4, 5, 6, 7], speed: 0.18 },
        jump: { frames: [8, 9], speed: 0.18 },
        lightAttack: { frames: [10, 11, 12], speed: 0.28 },
        heavyAttack: { frames: [13, 14, 15, 16], speed: 0.22 },
        block: { frames: [17], speed: 0.1 },
        hit: { frames: [18, 19], speed: 0.4 },
        special: { frames: [20, 21, 22, 23, 24, 25], speed: 0.25 }
      }
    },
    moves: {
      lightAttack: {
        damage: 14,
        startup: 4,
        active: 3,
        recovery: 7,
        hitbox: { x: 9, y: 19, width: 38, height: 19 }
      },
      heavyAttack: {
        damage: 23,
        startup: 10,
        active: 5,
        recovery: 13,
        hitbox: { x: 13, y: 13, width: 48, height: 28 }
      },
      special: {
        name: 'Deadline Pressure',
        damage: 38,
        startup: 18,
        active: 12,
        recovery: 22,
        input: ['charge-back-forward', 'punch'],
        hitbox: { x: 0, y: 5, width: 75, height: 45 }
      }
    },
    sounds: {
      attack: 'manager_attack',
      hit: 'manager_hit',
      special: 'manager_special',
      victory: 'manager_victory'
    }
  }
};

// Character select order
export const CHARACTER_SELECT_ORDER = ['MENTOR', 'STUDENT', 'MANAGER'];

// Helper functions
export const getCharacterById = (id) => {
  return Object.values(CHARACTERS).find(char => char.id === id);
};

export const getCharacterByName = (name) => {
  return CHARACTERS[name];
};

export const getAllCharacters = () => {
  return CHARACTER_SELECT_ORDER.map(name => CHARACTERS[name]);
};

// Frame data helpers
export const getFrameData = (character, move) => {
  const char = typeof character === 'string' ? getCharacterById(character) : character;
  return char?.moves[move] || null;
};

// Animation helpers
export const getAnimationData = (character, animation) => {
  const char = typeof character === 'string' ? getCharacterById(character) : character;
  return char?.sprite.animations[animation] || null;
}; 