import * as PIXI from 'pixi.js';
import { Howl } from 'howler';
import AssetLoader from './AssetLoader';
import SceneManager from './SceneManager';
import InputManager from '../systems/InputManager';
import CollisionSystem from '../systems/CollisionSystem';
import AudioManager from '../systems/AudioManager';
import Fighter from '../entities/Fighter';
import Stage from '../entities/Stage';

export default class Game {
  constructor(options = {}) {
    this.container = options.container;
    this.player1Character = options.player1Character;
    this.player2Character = options.player2Character;
    this.onGameStateChange = options.onGameStateChange || (() => {});
    this.onLoadingProgress = options.onLoadingProgress || (() => {});
    
    // Game state
    this.gameState = {
      round: 1,
      timer: 99,
      isPaused: false,
      gameStarted: false,
      winner: null,
      roundWinner: null
    };

    // Core systems
    this.app = null;
    this.assetLoader = null;
    this.sceneManager = null;
    this.inputManager = null;
    this.collisionSystem = null;
    this.audioManager = null;

    // Game entities
    this.stage = null;
    this.player1 = null;
    this.player2 = null;

    // Game loop
    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedTimeStep = 1000 / 60; // 60 FPS
    this.maxFrameTime = 1000 / 30; // Max 30 FPS fallback

    // Round management
    this.roundTimer = null;
    this.roundStartTime = 0;
    this.roundDuration = 99; // seconds

    this.initialize = this.initialize.bind(this);
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
  }

  async initialize() {
    try {
      // Initialize PixiJS Application
      this.app = new PIXI.Application({
        width: 1280,
        height: 720,
        backgroundColor: 0x000000,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
      });

      // Add canvas to container
      if (this.container) {
        this.container.appendChild(this.app.view);
      }

      // Make canvas responsive
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());

      // Initialize core systems
      this.assetLoader = new AssetLoader();
      this.sceneManager = new SceneManager(this.app);
      this.inputManager = new InputManager();
      this.collisionSystem = new CollisionSystem();
      this.audioManager = new AudioManager();

      // Load assets
      await this.loadAssets();

      // Initialize game entities
      this.initializeEntities();

      // Start game loop
      this.app.ticker.add(this.update);

      // Start first round
      this.startRound();

      console.log('Game initialized successfully');
      return Promise.resolve();

    } catch (error) {
      console.error('Game initialization failed:', error);
      return Promise.reject(error);
    }
  }

  async loadAssets() {
    const totalAssets = 10; // Approximate number of assets to load
    let loadedAssets = 0;

    const updateProgress = () => {
      loadedAssets++;
      const progress = (loadedAssets / totalAssets) * 100;
      this.onLoadingProgress(Math.min(progress, 100));
    };

    try {
      // Load character sprites (placeholder colored rectangles for now)
      this.createPlaceholderTextures();
      updateProgress();

      // Load stage background
      this.createStageTextures();
      updateProgress();

      // Load UI elements
      this.createUITextures();
      updateProgress();

      // Load sound effects (placeholder)
      await this.audioManager.loadSounds();
      updateProgress();

      // Update progress to 100%
      this.onLoadingProgress(100);

      return Promise.resolve();
    } catch (error) {
      console.error('Asset loading failed:', error);
      return Promise.reject(error);
    }
  }

  createPlaceholderTextures() {
    // Create colored rectangle textures for characters
    const characters = [this.player1Character, this.player2Character];
    
    characters.forEach((char, index) => {
      const graphics = new PIXI.Graphics();
      graphics.beginFill(char.colors.primary.replace('#', '0x'));
      graphics.drawRect(0, 0, 64, 64);
      graphics.endFill();
      
      const texture = this.app.renderer.generateTexture(graphics);
      PIXI.Texture.addToCache(texture, `${char.id}_idle`);
      
      // Create hit effect texture
      graphics.clear();
      graphics.beginFill(0xff0000);
      graphics.drawRect(0, 0, 64, 64);
      graphics.endFill();
      
      const hitTexture = this.app.renderer.generateTexture(graphics);
      PIXI.Texture.addToCache(hitTexture, `${char.id}_hit`);
    });
  }

  createStageTextures() {
    // Create stage background
    const graphics = new PIXI.Graphics();
    
    // Sky gradient
    graphics.beginFill(0x4a90e2);
    graphics.drawRect(0, 0, 1280, 360);
    graphics.endFill();
    
    // Ground
    graphics.beginFill(0x8b7355);
    graphics.drawRect(0, 360, 1280, 360);
    graphics.endFill();
    
    // nFactorial logo area (placeholder)
    graphics.beginFill(0x00ff41);
    graphics.drawRect(540, 500, 200, 100);
    graphics.endFill();
    
    const stageTexture = this.app.renderer.generateTexture(graphics);
    PIXI.Texture.addToCache(stageTexture, 'stage_background');
  }

  createUITextures() {
    // Create simple UI textures
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x333333);
    graphics.drawRect(0, 0, 100, 20);
    graphics.endFill();
    
    const uiTexture = this.app.renderer.generateTexture(graphics);
    PIXI.Texture.addToCache(uiTexture, 'ui_panel');
  }

  initializeEntities() {
    // Create stage
    this.stage = new Stage({
      texture: PIXI.Texture.from('stage_background'),
      bounds: { x: 0, y: 0, width: 1280, height: 720 }
    });
    this.app.stage.addChild(this.stage.container);

    // Create players
    this.player1 = new Fighter({
      character: this.player1Character,
      x: 320,
      y: 500,
      facing: 1, // facing right
      isPlayer1: true,
      inputManager: this.inputManager,
      audioManager: this.audioManager
    });

    this.player2 = new Fighter({
      character: this.player2Character,
      x: 960,
      y: 500,
      facing: -1, // facing left
      isPlayer1: false,
      inputManager: this.inputManager,
      audioManager: this.audioManager
    });

    this.app.stage.addChild(this.player1.container);
    this.app.stage.addChild(this.player2.container);

    // Set up fighter references for collision
    this.player1.setOpponent(this.player2);
    this.player2.setOpponent(this.player1);
  }

  startRound() {
    this.gameState.timer = this.roundDuration;
    this.gameState.gameStarted = true;
    this.gameState.roundWinner = null;
    this.roundStartTime = Date.now();

    // Reset fighters
    this.player1.resetForRound();
    this.player2.resetForRound();

    // Position fighters
    this.player1.setPosition(320, 500);
    this.player2.setPosition(960, 500);

    // Start round timer
    this.startRoundTimer();

    // Notify React
    this.onGameStateChange(this.gameState);

    console.log(`Round ${this.gameState.round} started`);
  }

  startRoundTimer() {
    this.roundTimer = setInterval(() => {
      if (!this.gameState.isPaused && this.gameState.gameStarted) {
        this.gameState.timer--;
        
        if (this.gameState.timer <= 0) {
          this.endRound('TIME');
        }

        this.onGameStateChange(this.gameState);
      }
    }, 1000);
  }

  update(deltaTime) {
    if (this.gameState.isPaused || !this.gameState.gameStarted) {
      return;
    }

    const now = Date.now();
    const frameTime = Math.min(now - this.lastTime, this.maxFrameTime);
    this.lastTime = now;
    this.accumulator += frameTime;

    // Fixed timestep updates
    while (this.accumulator >= this.fixedTimeStep) {
      this.fixedUpdate(this.fixedTimeStep / 1000);
      this.accumulator -= this.fixedTimeStep;
    }

    // Variable timestep updates (rendering, etc.)
    this.variableUpdate(deltaTime);
  }

  fixedUpdate(dt) {
    // Update input
    this.inputManager.update();

    // Update fighters
    this.player1.update(dt);
    this.player2.update(dt);

    // Check collisions
    this.collisionSystem.checkFighterCollisions(this.player1, this.player2);

    // Check stage boundaries
    this.checkStageBounds();

    // Check win conditions
    this.checkWinConditions();
  }

  variableUpdate(deltaTime) {
    // Update visual effects, animations, etc.
    this.player1.render(deltaTime);
    this.player2.render(deltaTime);
  }

  checkStageBounds() {
    const stageLeft = 50;
    const stageRight = 1230;

    // Keep players in bounds
    if (this.player1.x < stageLeft) this.player1.x = stageLeft;
    if (this.player1.x > stageRight) this.player1.x = stageRight;
    if (this.player2.x < stageLeft) this.player2.x = stageLeft;
    if (this.player2.x > stageRight) this.player2.x = stageRight;
  }

  checkWinConditions() {
    const p1Health = this.player1.health;
    const p2Health = this.player2.health;

    // Check for KO
    if (p1Health <= 0 && p2Health <= 0) {
      this.endRound('DRAW');
    } else if (p1Health <= 0) {
      this.endRound(this.player2Character.name);
    } else if (p2Health <= 0) {
      this.endRound(this.player1Character.name);
    }

    // Update React with current health
    this.onGameStateChange({
      ...this.gameState,
      player1: { 
        ...this.gameState.player1, 
        health: p1Health,
        wins: this.player1.roundWins
      },
      player2: { 
        ...this.gameState.player2, 
        health: p2Health,
        wins: this.player2.roundWins
      }
    });
  }

  endRound(winner) {
    clearInterval(this.roundTimer);
    this.gameState.roundWinner = winner;
    this.gameState.gameStarted = false;

    if (winner === this.player1Character.name) {
      this.player1.roundWins++;
    } else if (winner === this.player2Character.name) {
      this.player2.roundWins++;
    }

    // Check for game winner (best of 3)
    if (this.player1.roundWins >= 2) {
      this.gameState.winner = this.player1Character.name;
    } else if (this.player2.roundWins >= 2) {
      this.gameState.winner = this.player2Character.name;
    }

    // Notify React
    this.onGameStateChange(this.gameState);

    // Start next round or end game
    if (!this.gameState.winner) {
      setTimeout(() => {
        this.gameState.round++;
        this.startRound();
      }, 3000);
    }

    console.log(`Round ended. Winner: ${winner}`);
  }

  resizeCanvas() {
    if (!this.app) return;

    const parent = this.app.view.parentNode;
    if (!parent) return;

    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;
    
    const gameWidth = 1280;
    const gameHeight = 720;
    const gameRatio = gameWidth / gameHeight;
    const parentRatio = parentWidth / parentHeight;

    let newWidth, newHeight;

    if (parentRatio > gameRatio) {
      newHeight = parentHeight;
      newWidth = newHeight * gameRatio;
    } else {
      newWidth = parentWidth;
      newHeight = newWidth / gameRatio;
    }

    this.app.view.style.width = `${newWidth}px`;
    this.app.view.style.height = `${newHeight}px`;
  }

  pause() {
    this.gameState.isPaused = true;
    this.audioManager.pauseAll();
  }

  resume() {
    this.gameState.isPaused = false;
    this.audioManager.resumeAll();
  }

  restart() {
    // Reset game state
    this.gameState = {
      round: 1,
      timer: 99,
      isPaused: false,
      gameStarted: false,
      winner: null,
      roundWinner: null
    };

    // Reset fighters
    this.player1.reset();
    this.player2.reset();

    // Start first round
    this.startRound();
  }

  destroy() {
    if (this.roundTimer) {
      clearInterval(this.roundTimer);
    }

    if (this.app) {
      this.app.destroy(true, true);
    }

    if (this.audioManager) {
      this.audioManager.destroy();
    }

    console.log('Game destroyed');
  }
} 