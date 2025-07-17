import * as PIXI from 'pixi.js';

// Fighter states
const FIGHTER_STATES = {
  IDLE: 'idle',
  WALKING: 'walking',
  JUMPING: 'jumping',
  FALLING: 'falling',
  ATTACKING: 'attacking',
  BLOCKING: 'blocking',
  HITSTUN: 'hitstun',
  BLOCKSTUN: 'blockstun',
  KNOCKDOWN: 'knockdown'
};

export default class Fighter {
  constructor(options = {}) {
    this.character = options.character;
    this.isPlayer1 = options.isPlayer1 || false;
    this.inputManager = options.inputManager;
    this.audioManager = options.audioManager;
    
    // Position and physics
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.facing = options.facing || 1; // 1 = right, -1 = left
    this.width = this.character.sprite.width;
    this.height = this.character.sprite.height;
    
    // Combat stats
    this.health = this.character.stats.health;
    this.maxHealth = this.character.stats.health;
    this.isActive = true;
    this.isGrounded = true;
    
    // State machine
    this.state = FIGHTER_STATES.IDLE;
    this.stateTime = 0;
    this.previousState = null;
    
    // Combat mechanics
    this.attackData = null;
    this.hitTargets = new Set(); // Targets hit by current attack
    this.comboCount = 0;
    this.comboStartTime = 0;
    this.lastHitTime = 0;
    this.invulnerabilityFrames = 0;
    
    // Round tracking
    this.roundWins = 0;
    
    // Input handling
    this.playerTag = this.isPlayer1 ? 'player1' : 'player2';
    
    // Animation and visual
    this.container = new PIXI.Container();
    this.sprite = null;
    this.hitFlash = 0;
    
    // Create visual representation
    this.createSprite();
    this.updateFacing();
    
    // Physics constants
    this.gravity = 800; // pixels per second squared
    this.jumpPower = -400;
    this.walkSpeed = 200;
    this.friction = 0.8;
  }

  createSprite() {
    // Create sprite from character texture
    const textureName = `${this.character.id}_idle`;
    let texture = PIXI.Texture.from(textureName);
    
    // Fallback to colored rectangle if texture not found
    if (!texture.valid) {
      const graphics = new PIXI.Graphics();
      graphics.beginFill(this.character.colors.primary.replace('#', '0x'));
      graphics.drawRect(0, 0, this.width, this.height);
      graphics.endFill();
      texture = PIXI.Texture.from(graphics);
    }
    
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.set(0.5, 1); // Bottom center anchor
    this.container.addChild(this.sprite);
    
    // Add name label for debugging
    if (process.env.NODE_ENV === 'development') {
      const nameText = new PIXI.Text(this.character.name, {
        fontFamily: 'Arial',
        fontSize: 12,
        fill: this.character.colors.primary
      });
      nameText.anchor.set(0.5, 1);
      nameText.y = -this.height - 5;
      this.container.addChild(nameText);
    }
  }

  update(deltaTime) {
    this.stateTime += deltaTime;
    
    // Handle input
    this.handleInput();
    
    // Update state machine
    this.updateState(deltaTime);
    
    // Update physics
    this.updatePhysics(deltaTime);
    
    // Update visual effects
    this.updateVisualEffects(deltaTime);
    
    // Update position
    this.container.x = this.x;
    this.container.y = this.y;
  }

  handleInput() {
    if (!this.inputManager || !this.canReceiveInput()) {
      return;
    }

    const movement = this.inputManager.getMovementInput(this.playerTag);
    
    // Movement
    if (this.state === FIGHTER_STATES.IDLE || this.state === FIGHTER_STATES.WALKING) {
      if (movement.x !== 0) {
        this.setState(FIGHTER_STATES.WALKING);
        this.velocityX = movement.x * this.walkSpeed;
        this.setFacing(movement.x);
      } else {
        this.setState(FIGHTER_STATES.IDLE);
        this.velocityX *= this.friction;
      }
    }
    
    // Jump
    if (this.inputManager.isKeyPressed(this.playerTag, 'up') && this.isGrounded) {
      this.jump();
    }
    
    // Attacks
    if (this.inputManager.isKeyPressed(this.playerTag, 'lightAttack')) {
      this.tryAttack('lightAttack');
    }
    
    if (this.inputManager.isKeyPressed(this.playerTag, 'heavyAttack')) {
      this.tryAttack('heavyAttack');
    }
    
    // Block
    if (this.inputManager.isKeyDown(this.playerTag, 'block')) {
      if (this.state === FIGHTER_STATES.IDLE || this.state === FIGHTER_STATES.WALKING) {
        this.setState(FIGHTER_STATES.BLOCKING);
      }
    } else if (this.state === FIGHTER_STATES.BLOCKING) {
      this.setState(FIGHTER_STATES.IDLE);
    }
    
    // Check for special moves
    this.checkSpecialMoves();
  }

  updateState(deltaTime) {
    switch (this.state) {
      case FIGHTER_STATES.ATTACKING:
        this.updateAttackState();
        break;
      case FIGHTER_STATES.HITSTUN:
        if (this.stateTime >= 0.3) { // 300ms hitstun
          this.setState(FIGHTER_STATES.IDLE);
        }
        break;
      case FIGHTER_STATES.BLOCKSTUN:
        if (this.stateTime >= 0.15) { // 150ms blockstun
          this.setState(FIGHTER_STATES.IDLE);
        }
        break;
      case FIGHTER_STATES.JUMPING:
        if (this.velocityY >= 0) {
          this.setState(FIGHTER_STATES.FALLING);
        }
        break;
      case FIGHTER_STATES.FALLING:
        if (this.isGrounded) {
          this.setState(FIGHTER_STATES.IDLE);
        }
        break;
    }
    
    // Update invulnerability frames
    if (this.invulnerabilityFrames > 0) {
      this.invulnerabilityFrames--;
    }
  }

  updatePhysics(deltaTime) {
    // Apply gravity
    if (!this.isGrounded) {
      this.velocityY += this.gravity * deltaTime;
    }
    
    // Update position
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
    
    // Ground collision (simple)
    const groundY = 500; // Match initial Y position
    if (this.y >= groundY) {
      this.y = groundY;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
    
    // Apply friction to horizontal movement
    if (this.isGrounded && Math.abs(this.velocityX) > 1) {
      this.velocityX *= this.friction;
    }
  }

  updateVisualEffects(deltaTime) {
    // Hit flash effect
    if (this.hitFlash > 0) {
      this.hitFlash -= deltaTime * 10;
      this.sprite.tint = 0xff6666; // Red tint
    } else {
      this.sprite.tint = 0xffffff; // Normal color
    }
    
    // Invulnerability visual
    if (this.invulnerabilityFrames > 0) {
      this.sprite.alpha = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
    } else {
      this.sprite.alpha = 1;
    }
  }

  setState(newState) {
    if (this.state !== newState) {
      this.previousState = this.state;
      this.state = newState;
      this.stateTime = 0;
      this.onStateEnter(newState);
    }
  }

  onStateEnter(state) {
    switch (state) {
      case FIGHTER_STATES.ATTACKING:
        this.hitTargets.clear();
        break;
      case FIGHTER_STATES.JUMPING:
        this.velocityY = this.jumpPower;
        this.isGrounded = false;
        if (this.audioManager) {
          this.audioManager.playSound('jump');
        }
        break;
    }
  }

  jump() {
    if (this.isGrounded && this.canReceiveInput()) {
      this.setState(FIGHTER_STATES.JUMPING);
    }
  }

  tryAttack(attackType) {
    if (!this.canAttack()) {
      return false;
    }
    
    const moveData = this.character.moves[attackType];
    if (!moveData) {
      return false;
    }
    
    this.setState(FIGHTER_STATES.ATTACKING);
    this.attackData = { ...moveData, type: attackType };
    
    if (this.audioManager) {
      this.audioManager.playSound('attack');
    }
    
    return true;
  }

  updateAttackState() {
    if (!this.attackData) {
      this.setState(FIGHTER_STATES.IDLE);
      return;
    }
    
    const totalFrames = this.attackData.startup + this.attackData.active + this.attackData.recovery;
    const currentFrame = Math.floor(this.stateTime * 60); // Convert to frame count
    
    if (currentFrame >= totalFrames) {
      this.attackData = null;
      this.setState(FIGHTER_STATES.IDLE);
    }
  }

  checkSpecialMoves() {
    if (!this.inputManager) return;
    
    // Check for quarter circle forward + attack
    if (this.inputManager.checkQuarterCircleForward(this.playerTag)) {
      this.trySpecialMove();
    }
  }

  trySpecialMove() {
    if (!this.canAttack()) return false;
    
    const specialMove = this.character.moves.special;
    if (!specialMove) return false;
    
    this.setState(FIGHTER_STATES.ATTACKING);
    this.attackData = { ...specialMove, type: 'special' };
    
    if (this.audioManager) {
      this.audioManager.playSound('special');
    }
    
    return true;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    this.hitFlash = 1;
    
    if (this.health <= 0) {
      this.setState(FIGHTER_STATES.KNOCKDOWN);
      this.isActive = false;
    }
  }

  enterHitstun(duration) {
    this.setState(FIGHTER_STATES.HITSTUN);
    this.invulnerabilityFrames = Math.floor(duration * 0.6); // Some i-frames during hitstun
  }

  enterBlockstun(duration) {
    this.setState(FIGHTER_STATES.BLOCKSTUN);
  }

  applyKnockback(x, y) {
    this.velocityX += x;
    this.velocityY += y;
  }

  applyPushback(x, y) {
    this.x += x;
    this.y += y;
  }

  setFacing(direction) {
    if (direction !== 0) {
      this.facing = direction > 0 ? 1 : -1;
      this.updateFacing();
    }
  }

  updateFacing() {
    this.sprite.scale.x = this.facing * Math.abs(this.sprite.scale.x);
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setOpponent(opponent) {
    this.opponent = opponent;
  }

  // Combat state checks
  canReceiveInput() {
    return this.state !== FIGHTER_STATES.HITSTUN && 
           this.state !== FIGHTER_STATES.BLOCKSTUN && 
           this.state !== FIGHTER_STATES.KNOCKDOWN &&
           this.state !== FIGHTER_STATES.ATTACKING;
  }

  canAttack() {
    return this.state === FIGHTER_STATES.IDLE || 
           this.state === FIGHTER_STATES.WALKING ||
           this.state === FIGHTER_STATES.JUMPING ||
           this.state === FIGHTER_STATES.FALLING;
  }

  isAttacking() {
    return this.state === FIGHTER_STATES.ATTACKING && this.attackData;
  }

  isBlocking() {
    return this.state === FIGHTER_STATES.BLOCKING;
  }

  isInvulnerable() {
    return this.invulnerabilityFrames > 0 || 
           this.state === FIGHTER_STATES.KNOCKDOWN;
  }

  hasAlreadyHit(target) {
    return this.hitTargets.has(target);
  }

  markHit(target) {
    this.hitTargets.add(target);
  }

  // Collision boxes
  getCurrentHitbox() {
    if (!this.isAttacking() || !this.attackData) {
      return null;
    }
    
    const hitbox = this.attackData.hitbox;
    return {
      x: this.x + (hitbox.x * this.facing),
      y: this.y - this.height + hitbox.y,
      width: hitbox.width,
      height: hitbox.height
    };
  }

  getHurtbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height,
      width: this.width,
      height: this.height
    };
  }

  getCurrentAttackData() {
    return this.attackData;
  }

  // Round management
  resetForRound() {
    this.health = this.maxHealth;
    this.setState(FIGHTER_STATES.IDLE);
    this.velocityX = 0;
    this.velocityY = 0;
    this.isActive = true;
    this.comboCount = 0;
    this.invulnerabilityFrames = 0;
    this.hitTargets.clear();
  }

  reset() {
    this.resetForRound();
    this.roundWins = 0;
  }

  render(deltaTime) {
    // Update visual position
    this.container.x = this.x;
    this.container.y = this.y;
  }

  destroy() {
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy();
  }
} 