import * as PIXI from 'pixi.js';

export default class AssetLoader {
  constructor() {
    this.loadedAssets = new Map();
    this.loadPromises = new Map();
    this.loader = PIXI.Loader.shared;
  }

  async loadTexture(name, url) {
    if (this.loadedAssets.has(name)) {
      return this.loadedAssets.get(name);
    }

    if (this.loadPromises.has(name)) {
      return this.loadPromises.get(name);
    }

    const promise = new Promise((resolve, reject) => {
      const texture = PIXI.Texture.from(url);
      
      if (texture.baseTexture.valid) {
        this.loadedAssets.set(name, texture);
        resolve(texture);
      } else {
        texture.baseTexture.on('loaded', () => {
          this.loadedAssets.set(name, texture);
          resolve(texture);
        });
        
        texture.baseTexture.on('error', reject);
      }
    });

    this.loadPromises.set(name, promise);
    return promise;
  }

  async loadSpriteSheet(name, url, frameData) {
    const texture = await this.loadTexture(name, url);
    const spriteSheet = new PIXI.Spritesheet(texture, frameData);
    
    return new Promise((resolve, reject) => {
      spriteSheet.parse((textures) => {
        this.loadedAssets.set(`${name}_sheet`, spriteSheet);
        resolve(textures);
      });
    });
  }

  getTexture(name) {
    return this.loadedAssets.get(name);
  }

  getSpriteSheet(name) {
    return this.loadedAssets.get(`${name}_sheet`);
  }

  createPlaceholderTexture(width, height, color = 0xff0000) {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(color);
    graphics.drawRect(0, 0, width, height);
    graphics.endFill();
    
    return PIXI.Texture.from(graphics);
  }

  async loadAllAssets(assetList, onProgress) {
    const totalAssets = assetList.length;
    let loadedCount = 0;

    const updateProgress = () => {
      loadedCount++;
      if (onProgress) {
        onProgress(loadedCount / totalAssets);
      }
    };

    const promises = assetList.map(async (asset) => {
      try {
        if (asset.type === 'texture') {
          await this.loadTexture(asset.name, asset.url);
        } else if (asset.type === 'spritesheet') {
          await this.loadSpriteSheet(asset.name, asset.url, asset.frameData);
        }
        updateProgress();
      } catch (error) {
        console.error(`Failed to load asset ${asset.name}:`, error);
        updateProgress();
      }
    });

    await Promise.all(promises);
  }

  destroy() {
    this.loadedAssets.clear();
    this.loadPromises.clear();
  }
} 