// Main game configuration and initialization
class Game {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            parent: 'phaser-game',
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: '#1a1a2e',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            },
            scene: [TitleScene, GameScene],
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            render: {
                pixelArt: false,
                antialias: true
            }
        };
        
        this.game = null;
        this.uiManager = null;
        this.currentScene = null;
        
        this.initialize();
    }
    
    initialize() {
        console.log('Initializing Phaser game...');
        
        // Create Phaser game instance
        this.game = new Phaser.Game(this.config);
        
        // Make game instance globally available
        window.gameInstance = this;
        
        // Initialize UI manager
        this.uiManager = new UIManager();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle game events
        this.setupGameEvents();
        
        console.log('Phaser game initialized successfully');
    }
    
    setupGameEvents() {
        // Listen for scene changes
        this.game.events.on('scenechange', (fromScene, toScene) => {
            this.currentScene = toScene;
            console.log(`Scene changed from ${fromScene} to ${toScene}`);
        });
        
        // Listen for game pause/resume
        this.game.events.on('pause', () => {
            console.log('Game paused');
        });
        
        this.game.events.on('resume', () => {
            console.log('Game resumed');
        });
    }
    
    handleResize() {
        // Update game size
        this.game.scale.resize(window.innerWidth, window.innerHeight);
        
        // Update UI if needed
        if (this.uiManager) {
            // UI manager can handle any resize-specific updates
        }
    }
    
    startGame() {
        if (this.game && this.game.scene) {
            console.log('Starting GameScene...');
            this.game.scene.start('GameScene');
        } else {
            console.error('Game or scene not available for startGame');
        }
    }
    
    stopGame() {
        if (this.game && this.game.scene) {
            console.log('Stopping GameScene...');
            this.game.scene.stop('GameScene');
            this.game.scene.start('TitleScene');
        }
    }
    
    pauseGame() {
        if (this.game) {
            this.game.scene.pause();
        }
    }
    
    resumeGame() {
        if (this.game) {
            this.game.scene.resume();
        }
    }
    
    getCurrentScene() {
        return this.currentScene;
    }
    
    getUIManager() {
        return this.uiManager;
    }
    
    destroy() {
        if (this.game) {
            this.game.destroy(true);
        }
    }
}

// Global game instance
let gameInstance = null;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking for Phaser...');
    
    // Wait for Phaser to be available
    if (typeof Phaser !== 'undefined') {
        console.log('Phaser available, creating game instance...');
        gameInstance = new Game();
    } else {
        console.log('Phaser not available yet, waiting...');
        // If Phaser isn't loaded yet, wait for it
        const checkPhaser = setInterval(() => {
            if (typeof Phaser !== 'undefined') {
                clearInterval(checkPhaser);
                console.log('Phaser now available, creating game instance...');
                gameInstance = new Game();
            }
        }, 100);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
} 