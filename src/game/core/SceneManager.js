import * as PIXI from 'pixi.js';

export default class SceneManager {
  constructor(app) {
    this.app = app;
    this.scenes = new Map();
    this.currentScene = null;
    this.isTransitioning = false;
  }

  createScene(name) {
    const scene = new PIXI.Container();
    scene.name = name;
    this.scenes.set(name, scene);
    return scene;
  }

  addScene(name, scene) {
    this.scenes.set(name, scene);
  }

  async switchToScene(sceneName, transition = null) {
    if (this.isTransitioning) {
      console.warn('Scene transition already in progress');
      return;
    }

    const newScene = this.scenes.get(sceneName);
    if (!newScene) {
      console.error(`Scene '${sceneName}' not found`);
      return;
    }

    this.isTransitioning = true;

    try {
      if (transition) {
        await this.performTransition(newScene, transition);
      } else {
        this.switchSceneImmediate(newScene);
      }
    } finally {
      this.isTransitioning = false;
    }
  }

  switchSceneImmediate(newScene) {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene);
    }

    this.currentScene = newScene;
    this.app.stage.addChild(newScene);
  }

  async performTransition(newScene, transition) {
    switch (transition.type) {
      case 'fade':
        await this.fadeTransition(newScene, transition.duration || 1000);
        break;
      case 'slide':
        await this.slideTransition(newScene, transition);
        break;
      default:
        this.switchSceneImmediate(newScene);
    }
  }

  async fadeTransition(newScene, duration) {
    // Create fade overlay
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000);
    overlay.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.endFill();
    overlay.alpha = 0;

    this.app.stage.addChild(overlay);

    // Fade out
    await this.tweenProperty(overlay, 'alpha', 1, duration / 2);

    // Switch scene
    this.switchSceneImmediate(newScene);

    // Fade in
    await this.tweenProperty(overlay, 'alpha', 0, duration / 2);

    // Remove overlay
    this.app.stage.removeChild(overlay);
  }

  async slideTransition(newScene, transition) {
    const direction = transition.direction || 'left';
    const duration = transition.duration || 1000;
    const screenWidth = this.app.screen.width;

    // Position new scene off-screen
    switch (direction) {
      case 'left':
        newScene.x = -screenWidth;
        break;
      case 'right':
        newScene.x = screenWidth;
        break;
    }

    // Add new scene
    this.app.stage.addChild(newScene);

    // Animate both scenes
    const promises = [];

    if (this.currentScene) {
      const targetX = direction === 'left' ? screenWidth : -screenWidth;
      promises.push(this.tweenProperty(this.currentScene, 'x', targetX, duration));
    }

    promises.push(this.tweenProperty(newScene, 'x', 0, duration));

    await Promise.all(promises);

    // Clean up
    if (this.currentScene && this.currentScene !== newScene) {
      this.app.stage.removeChild(this.currentScene);
      this.currentScene.x = 0; // Reset position
    }

    this.currentScene = newScene;
  }

  tweenProperty(object, property, targetValue, duration) {
    return new Promise((resolve) => {
      const startValue = object[property];
      const difference = targetValue - startValue;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease out)
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        object[property] = startValue + (difference * easedProgress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          object[property] = targetValue;
          resolve();
        }
      };

      animate();
    });
  }

  getCurrentScene() {
    return this.currentScene;
  }

  getScene(name) {
    return this.scenes.get(name);
  }

  removeScene(name) {
    const scene = this.scenes.get(name);
    if (scene) {
      if (scene === this.currentScene) {
        this.app.stage.removeChild(scene);
        this.currentScene = null;
      }
      this.scenes.delete(name);
    }
  }

  preloadScene(name, setupFunction) {
    const scene = this.createScene(name);
    if (setupFunction) {
      setupFunction(scene);
    }
    return scene;
  }

  destroy() {
    this.scenes.clear();
    this.currentScene = null;
    this.isTransitioning = false;
  }
} 