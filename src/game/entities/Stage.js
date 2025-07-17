import * as PIXI from 'pixi.js';

export default class Stage {
  constructor(options = {}) {
    this.texture = options.texture;
    this.bounds = options.bounds || { x: 0, y: 0, width: 1280, height: 720 };
    
    // Create container for all stage elements
    this.container = new PIXI.Container();
    
    // Stage properties
    this.leftBound = 50;
    this.rightBound = 1230;
    this.groundY = 500;
    this.ceiling = 50;
    
    this.createStage();
  }

  createStage() {
    // Background
    if (this.texture) {
      this.background = new PIXI.Sprite(this.texture);
      this.container.addChild(this.background);
    } else {
      this.createDefaultBackground();
    }
    
    // Add stage decorations
    this.createDecorations();
    
    // Add boundary indicators (for development)
    if (process.env.NODE_ENV === 'development') {
      this.createBoundaryIndicators();
    }
  }

  createDefaultBackground() {
    const graphics = new PIXI.Graphics();
    
    // Sky gradient (simplified)
    graphics.beginFill(0x4a90e2);
    graphics.drawRect(0, 0, this.bounds.width, this.groundY);
    graphics.endFill();
    
    // Ground
    graphics.beginFill(0x8b7355);
    graphics.drawRect(0, this.groundY, this.bounds.width, this.bounds.height - this.groundY);
    graphics.endFill();
    
    this.background = graphics;
    this.container.addChild(this.background);
  }

  createDecorations() {
    // nFactorial logo/branding area
    const logoArea = new PIXI.Graphics();
    logoArea.beginFill(0x00ff41);
    logoArea.drawRect(540, 550, 200, 80);
    logoArea.endFill();
    
    // Add "nFactorial" text
    const logoText = new PIXI.Text('nFactorial', {
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: 'bold',
      fill: 0x000000
    });
    logoText.anchor.set(0.5);
    logoText.x = 640;
    logoText.y = 590;
    
    this.container.addChild(logoArea);
    this.container.addChild(logoText);
    
    // Additional decorative elements
    this.createEnvironmentDetails();
  }

  createEnvironmentDetails() {
    // Coding-themed decorations
    
    // "Code blocks" in the background
    for (let i = 0; i < 3; i++) {
      const codeBlock = new PIXI.Graphics();
      codeBlock.beginFill(0x2d3748);
      codeBlock.drawRoundedRect(0, 0, 120, 80, 8);
      codeBlock.endFill();
      
      // Add some "code lines"
      for (let j = 0; j < 4; j++) {
        const line = new PIXI.Graphics();
        const lineWidth = Math.random() * 80 + 20;
        line.lineStyle(2, 0x00ff41);
        line.moveTo(10, 15 + j * 15);
        line.lineTo(10 + lineWidth, 15 + j * 15);
        codeBlock.addChild(line);
      }
      
      codeBlock.x = 100 + i * 350;
      codeBlock.y = 200 + Math.random() * 100;
      codeBlock.alpha = 0.6;
      
      this.container.addChild(codeBlock);
    }
    
    // Pixel art style decorations
    this.createPixelDecorations();
  }

  createPixelDecorations() {
    // Simple pixel art style elements
    const colors = [0xff6b35, 0x00ff41, 0x4a90e2, 0x9c27b0];
    
    for (let i = 0; i < 8; i++) {
      const pixel = new PIXI.Graphics();
      pixel.beginFill(colors[i % colors.length]);
      pixel.drawRect(0, 0, 16, 16);
      pixel.endFill();
      
      pixel.x = Math.random() * this.bounds.width;
      pixel.y = Math.random() * 200 + 100;
      pixel.alpha = 0.4;
      
      this.container.addChild(pixel);
    }
  }

  createBoundaryIndicators() {
    // Left boundary
    const leftBoundary = new PIXI.Graphics();
    leftBoundary.lineStyle(2, 0xff0000);
    leftBoundary.moveTo(this.leftBound, 0);
    leftBoundary.lineTo(this.leftBound, this.bounds.height);
    
    // Right boundary
    const rightBoundary = new PIXI.Graphics();
    rightBoundary.lineStyle(2, 0xff0000);
    rightBoundary.moveTo(this.rightBound, 0);
    rightBoundary.lineTo(this.rightBound, this.bounds.height);
    
    // Ground line
    const groundLine = new PIXI.Graphics();
    groundLine.lineStyle(2, 0x00ff00);
    groundLine.moveTo(0, this.groundY);
    groundLine.lineTo(this.bounds.width, this.groundY);
    
    this.container.addChild(leftBoundary);
    this.container.addChild(rightBoundary);
    this.container.addChild(groundLine);
  }

  // Get stage boundaries for collision detection
  getBounds() {
    return {
      left: this.leftBound,
      right: this.rightBound,
      top: this.ceiling,
      bottom: this.groundY
    };
  }

  // Check if a point is within stage bounds
  isInBounds(x, y) {
    return x >= this.leftBound && 
           x <= this.rightBound && 
           y >= this.ceiling && 
           y <= this.groundY;
  }

  // Get ground Y position at a given X coordinate
  getGroundY(x) {
    // For now, flat ground everywhere
    return this.groundY;
  }

  // Update stage (for animated elements)
  update(deltaTime) {
    // Add any stage animations here
    // For example, floating particles, animated backgrounds, etc.
  }

  // Cleanup
  destroy() {
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy();
  }
} 