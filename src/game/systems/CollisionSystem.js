// Collision detection system for fighting game

export default class CollisionSystem {
  constructor() {
    this.hitEffects = [];
  }

  // Main collision check between two fighters
  checkFighterCollisions(fighter1, fighter2) {
    // Check if fighters can hit each other
    if (!this.canFightersInteract(fighter1, fighter2)) {
      return;
    }

    // Check fighter1 hitting fighter2
    this.checkFighterHit(fighter1, fighter2);
    
    // Check fighter2 hitting fighter1
    this.checkFighterHit(fighter2, fighter1);
  }

  canFightersInteract(fighter1, fighter2) {
    // Both fighters must be active
    if (!fighter1.isActive || !fighter2.isActive) {
      return false;
    }

    // Can't hit yourself
    if (fighter1 === fighter2) {
      return false;
    }

    return true;
  }

  checkFighterHit(attacker, defender) {
    // Attacker must be in an attacking state
    if (!attacker.isAttacking()) {
      return false;
    }

    // Get attacker's current hitbox
    const hitbox = attacker.getCurrentHitbox();
    if (!hitbox) {
      return false;
    }

    // Get defender's hurtbox
    const hurtbox = defender.getHurtbox();
    if (!hurtbox) {
      return false;
    }

    // Check if hitbox overlaps with hurtbox
    if (this.checkAABBCollision(hitbox, hurtbox)) {
      // Check if attack can connect
      if (this.canAttackConnect(attacker, defender)) {
        this.processHit(attacker, defender);
        return true;
      }
    }

    return false;
  }

  checkAABBCollision(box1, box2) {
    // Axis-Aligned Bounding Box collision detection
    return (
      box1.x < box2.x + box2.width &&
      box1.x + box1.width > box2.x &&
      box1.y < box2.y + box2.height &&
      box1.y + box1.height > box2.y
    );
  }

  canAttackConnect(attacker, defender) {
    // Check if defender is in a state that can be hit
    if (defender.isInvulnerable()) {
      return false;
    }

    // Check if this specific attack has already hit this frame
    if (attacker.hasAlreadyHit(defender)) {
      return false;
    }

    // Check if defender is blocking
    if (defender.isBlocking()) {
      // Check if attack can be blocked
      const attackData = attacker.getCurrentAttackData();
      if (attackData && !attackData.unblockable) {
        // Process block instead of hit
        this.processBlock(attacker, defender);
        return false;
      }
    }

    return true;
  }

  processHit(attacker, defender) {
    const attackData = attacker.getCurrentAttackData();
    if (!attackData) return;

    // Calculate damage
    let damage = attackData.damage;
    
    // Apply damage scaling based on combo
    if (defender.comboCount > 0) {
      damage *= this.getDamageScaling(defender.comboCount);
    }

    // Apply damage
    defender.takeDamage(damage);

    // Apply hitstun
    defender.enterHitstun(attackData.hitstun || 10);

    // Apply knockback
    if (attackData.knockback) {
      const direction = attacker.facing;
      defender.applyKnockback(
        attackData.knockback.x * direction,
        attackData.knockback.y
      );
    }

    // Update combo counter
    if (defender.comboCount === 0) {
      defender.comboStartTime = Date.now();
    }
    defender.comboCount++;
    defender.lastHitTime = Date.now();

    // Mark attacker as having hit
    attacker.markHit(defender);

    // Create hit effect
    this.createHitEffect(attacker, defender, attackData);

    // Play sound effect
    if (attacker.audioManager) {
      attacker.audioManager.playSound('hit');
    }

    console.log(`${attacker.character.name} hit ${defender.character.name} for ${damage} damage`);
  }

  processBlock(attacker, defender) {
    const attackData = attacker.getCurrentAttackData();
    if (!attackData) return;

    // Calculate chip damage (reduced damage through block)
    const chipDamage = Math.floor(attackData.damage * 0.1);
    if (chipDamage > 0) {
      defender.takeDamage(chipDamage);
    }

    // Apply blockstun
    defender.enterBlockstun(attackData.blockstun || 5);

    // Apply pushback
    const direction = attacker.facing;
    defender.applyPushback(15 * direction, 0);
    attacker.applyPushback(-5 * direction, 0); // Attacker gets slight pushback too

    // Mark attacker as having hit (to prevent multiple blocks)
    attacker.markHit(defender);

    // Create block effect
    this.createBlockEffect(attacker, defender);

    // Play block sound
    if (defender.audioManager) {
      defender.audioManager.playSound('block');
    }

    console.log(`${defender.character.name} blocked ${attacker.character.name}'s attack`);
  }

  getDamageScaling(comboCount) {
    // Damage scaling to prevent infinite combos
    if (comboCount <= 2) return 1.0;
    if (comboCount <= 4) return 0.8;
    if (comboCount <= 6) return 0.6;
    if (comboCount <= 8) return 0.4;
    return 0.2; // Minimum scaling
  }

  createHitEffect(attacker, defender, attackData) {
    const effect = {
      type: 'hit',
      x: defender.x + defender.width / 2,
      y: defender.y + defender.height / 2,
      duration: 10,
      frame: 0,
      color: attackData.hitColor || 0xff0000
    };

    this.hitEffects.push(effect);
  }

  createBlockEffect(attacker, defender) {
    const effect = {
      type: 'block',
      x: defender.x + (defender.facing > 0 ? 0 : defender.width),
      y: defender.y + defender.height / 2,
      duration: 8,
      frame: 0,
      color: 0x00ffff
    };

    this.hitEffects.push(effect);
  }

  // Check collision between fighter and stage boundaries
  checkStageBounds(fighter, stageBounds) {
    let corrected = false;

    if (fighter.x < stageBounds.left) {
      fighter.x = stageBounds.left;
      corrected = true;
    }

    if (fighter.x + fighter.width > stageBounds.right) {
      fighter.x = stageBounds.right - fighter.width;
      corrected = true;
    }

    if (fighter.y + fighter.height > stageBounds.bottom) {
      fighter.y = stageBounds.bottom - fighter.height;
      fighter.velocityY = 0;
      fighter.isGrounded = true;
      corrected = true;
    }

    return corrected;
  }

  // Check if two fighters are overlapping (push apart)
  checkFighterOverlap(fighter1, fighter2) {
    const overlap = this.getFighterOverlap(fighter1, fighter2);
    
    if (overlap > 0) {
      // Push fighters apart
      const pushDistance = overlap / 2;
      
      if (fighter1.x < fighter2.x) {
        fighter1.x -= pushDistance;
        fighter2.x += pushDistance;
      } else {
        fighter1.x += pushDistance;
        fighter2.x -= pushDistance;
      }
      
      return true;
    }
    
    return false;
  }

  getFighterOverlap(fighter1, fighter2) {
    const left1 = fighter1.x;
    const right1 = fighter1.x + fighter1.width;
    const left2 = fighter2.x;
    const right2 = fighter2.x + fighter2.width;

    if (right1 <= left2 || right2 <= left1) {
      return 0; // No overlap
    }

    return Math.min(right1 - left2, right2 - left1);
  }

  // Update hit effects
  updateEffects(deltaTime) {
    this.hitEffects = this.hitEffects.filter(effect => {
      effect.frame++;
      return effect.frame < effect.duration;
    });
  }

  // Get current hit effects for rendering
  getActiveEffects() {
    return this.hitEffects;
  }

  // Clear all effects
  clearEffects() {
    this.hitEffects = [];
  }

  // Projectile collision (for future use)
  checkProjectileCollisions(projectiles, fighters) {
    projectiles.forEach(projectile => {
      if (!projectile.isActive) return;

      fighters.forEach(fighter => {
        if (fighter === projectile.owner) return;
        if (!fighter.isActive) return;

        const projectileBox = projectile.getBoundingBox();
        const fighterBox = fighter.getHurtbox();

        if (this.checkAABBCollision(projectileBox, fighterBox)) {
          if (this.canProjectileHit(projectile, fighter)) {
            this.processProjectileHit(projectile, fighter);
          }
        }
      });
    });
  }

  canProjectileHit(projectile, fighter) {
    if (fighter.isInvulnerable()) return false;
    if (fighter.isBlocking() && projectile.canBeBlocked) {
      this.processProjectileBlock(projectile, fighter);
      return false;
    }
    return true;
  }

  processProjectileHit(projectile, fighter) {
    const damage = projectile.damage;
    fighter.takeDamage(damage);
    fighter.enterHitstun(projectile.hitstun);
    
    projectile.onHit(fighter);
    this.createHitEffect(projectile, fighter, { hitColor: projectile.color });
  }

  processProjectileBlock(projectile, fighter) {
    const chipDamage = Math.floor(projectile.damage * 0.05);
    fighter.takeDamage(chipDamage);
    fighter.enterBlockstun(3);
    
    projectile.onBlock(fighter);
    this.createBlockEffect(projectile, fighter);
  }

  // Debug visualization
  getDebugData() {
    return {
      hitEffects: this.hitEffects,
      activeCollisions: this.activeCollisions || []
    };
  }
} 