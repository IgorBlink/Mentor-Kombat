// Fighting game input manager with buffering and combo detection

export default class InputManager {
  constructor() {
    // Key mappings for two players
    this.keyMappings = {
      player1: {
        up: 'KeyW',
        down: 'KeyS',
        left: 'KeyA',
        right: 'KeyD',
        lightAttack: 'Space',
        heavyAttack: 'Enter',
        block: 'ShiftLeft'
      },
      player2: {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        lightAttack: 'Numpad0',
        heavyAttack: 'Numpad1',
        block: 'Numpad2'
      }
    };

    // Current key states
    this.keys = {};
    this.previousKeys = {};

    // Input buffers for combo detection
    this.inputBuffers = {
      player1: [],
      player2: []
    };

    // Buffer settings
    this.bufferSize = 8; // frames to keep in buffer
    this.bufferWindow = 5; // frames to allow buffered inputs

    // Bind event listeners
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    // Add event listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  handleKeyDown(event) {
    this.keys[event.code] = true;
    
    // Add to input buffer
    this.addToBuffer('player1', event.code);
    this.addToBuffer('player2', event.code);
  }

  handleKeyUp(event) {
    this.keys[event.code] = false;
  }

  addToBuffer(player, keyCode) {
    const buffer = this.inputBuffers[player];
    const mappings = this.keyMappings[player];
    
    // Convert keyCode to action
    const action = this.getActionFromKeyCode(keyCode, mappings);
    if (action) {
      buffer.push({
        action,
        timestamp: Date.now(),
        frame: this.currentFrame || 0
      });

      // Keep buffer size manageable
      if (buffer.length > this.bufferSize) {
        buffer.shift();
      }
    }
  }

  getActionFromKeyCode(keyCode, mappings) {
    for (const [action, code] of Object.entries(mappings)) {
      if (code === keyCode) {
        return action;
      }
    }
    return null;
  }

  update() {
    // Store previous frame state
    this.previousKeys = { ...this.keys };
    this.currentFrame = (this.currentFrame || 0) + 1;

    // Clean old buffer entries
    this.cleanBuffers();
  }

  cleanBuffers() {
    const cutoffTime = Date.now() - 300; // 300ms buffer window
    
    Object.keys(this.inputBuffers).forEach(player => {
      this.inputBuffers[player] = this.inputBuffers[player].filter(
        input => input.timestamp > cutoffTime
      );
    });
  }

  // Check if key is currently pressed
  isKeyDown(player, action) {
    const keyCode = this.keyMappings[player][action];
    return this.keys[keyCode] || false;
  }

  // Check if key was just pressed this frame
  isKeyPressed(player, action) {
    const keyCode = this.keyMappings[player][action];
    return (this.keys[keyCode] || false) && !(this.previousKeys[keyCode] || false);
  }

  // Check if key was just released this frame
  isKeyReleased(player, action) {
    const keyCode = this.keyMappings[player][action];
    return !(this.keys[keyCode] || false) && (this.previousKeys[keyCode] || false);
  }

  // Get movement input as vector
  getMovementInput(player) {
    const horizontal = this.isKeyDown(player, 'right') ? 1 : (this.isKeyDown(player, 'left') ? -1 : 0);
    const vertical = this.isKeyDown(player, 'up') ? -1 : (this.isKeyDown(player, 'down') ? 1 : 0);
    
    return { x: horizontal, y: vertical };
  }

  // Get current directional input (for special moves)
  getDirectionalInput(player) {
    const movement = this.getMovementInput(player);
    
    if (movement.x === 0 && movement.y === 0) return 'neutral';
    if (movement.x === 0 && movement.y === -1) return 'up';
    if (movement.x === 0 && movement.y === 1) return 'down';
    if (movement.x === -1 && movement.y === 0) return 'left';
    if (movement.x === 1 && movement.y === 0) return 'right';
    if (movement.x === -1 && movement.y === -1) return 'upleft';
    if (movement.x === 1 && movement.y === -1) return 'upright';
    if (movement.x === -1 && movement.y === 1) return 'downleft';
    if (movement.x === 1 && movement.y === 1) return 'downright';
    
    return 'neutral';
  }

  // Check for special move patterns
  checkSpecialMove(player, pattern) {
    const buffer = this.inputBuffers[player];
    if (buffer.length < pattern.length) return false;

    // Get recent inputs
    const recentInputs = buffer.slice(-pattern.length);
    
    // Check if pattern matches
    for (let i = 0; i < pattern.length; i++) {
      const expectedAction = pattern[i];
      const actualAction = recentInputs[i]?.action;
      
      if (expectedAction !== actualAction) {
        return false;
      }
    }

    return true;
  }

  // Check for quarter circle forward (↓↘→ + attack)
  checkQuarterCircleForward(player) {
    const buffer = this.inputBuffers[player];
    if (buffer.length < 4) return false;

    const recent = buffer.slice(-4);
    
    // Look for down, downright, right, attack pattern
    return (
      recent[0]?.action === 'down' &&
      this.getDirectionalFromRecent(recent[1]) === 'downright' &&
      recent[2]?.action === 'right' &&
      (recent[3]?.action === 'lightAttack' || recent[3]?.action === 'heavyAttack')
    );
  }

  // Check for charge move (←→ + attack)
  checkChargeMove(player) {
    const buffer = this.inputBuffers[player];
    if (buffer.length < 3) return false;

    const recent = buffer.slice(-3);
    
    // Look for left held, then right + attack
    return (
      recent[0]?.action === 'left' &&
      recent[1]?.action === 'right' &&
      (recent[2]?.action === 'lightAttack' || recent[2]?.action === 'heavyAttack')
    );
  }

  getDirectionalFromRecent(input) {
    // Helper to determine diagonal directions from buffer
    if (!input) return 'neutral';
    
    // This would need more sophisticated logic to detect
    // simultaneous directional inputs for diagonals
    return input.action;
  }

  // Check if input is buffered (pressed within buffer window)
  isInputBuffered(player, action, maxFramesAgo = 5) {
    const buffer = this.inputBuffers[player];
    const currentFrame = this.currentFrame || 0;
    
    return buffer.some(input => 
      input.action === action && 
      (currentFrame - input.frame) <= maxFramesAgo
    );
  }

  // Get raw input state for debugging
  getRawInputState(player) {
    const mappings = this.keyMappings[player];
    const state = {};
    
    Object.keys(mappings).forEach(action => {
      state[action] = this.isKeyDown(player, action);
    });
    
    return state;
  }

  // Clear input buffer (useful for round resets)
  clearBuffer(player) {
    this.inputBuffers[player] = [];
  }

  clearAllBuffers() {
    Object.keys(this.inputBuffers).forEach(player => {
      this.clearBuffer(player);
    });
  }

  // Cleanup
  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
} 