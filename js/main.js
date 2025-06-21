// Main game initialization and UI management
class AmberShaperGame {
    constructor() {
        this.game = null;
        this.currentScreen = 'title';
        this.score = 0;
        this.gameTime = 0;
        this.phase = 1;
        
        console.log('AmberShaperGame initialized');
        this.initializeUI();
        this.waitForGameInstance();
    }
    
    waitForGameInstance() {
        console.log('Waiting for game instance...');
        
        // Wait for the game instance to be created
        const checkGame = setInterval(() => {
            if (window.gameInstance && window.gameInstance.game) {
                clearInterval(checkGame);
                this.game = window.gameInstance;
                this.initializeGame();
                console.log('Game instance connected successfully');
            } else {
                console.log('Game instance not ready yet...');
            }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            if (!this.game) {
                console.error('Game instance failed to initialize after 10 seconds');
                clearInterval(checkGame);
            }
        }, 10000);
    }
    
    initializeUI() {
        console.log('Initializing UI...');
        
        // Title screen buttons
        const startButton = document.getElementById('start-game');
        const instructionsButton = document.getElementById('instructions-btn');
        
        if (startButton) {
            startButton.addEventListener('click', () => {
                console.log('Start game clicked');
                this.showScreen('game');
                //this.startGame();
                this.restartGame();
            });
        } else {
            console.error('Start game button not found!');
        }
        
        if (instructionsButton) {
            instructionsButton.addEventListener('click', () => {
                console.log('Instructions clicked');
                this.showScreen('instructions');
            });
        } else {
            console.error('Instructions button not found!');
        }
        
        // Instructions screen
        const backButton = document.getElementById('back-to-title');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.showScreen('title');
            });
        }
        
        // Ability buttons
        document.querySelectorAll('.ability-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ability = e.currentTarget.dataset.ability;
                this.useAbility(ability);
            });
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.currentScreen === 'game') {
                this.handleKeyPress(e);
            }
        });
        
        // Ensure title screen is visible
        this.showScreen('title');
        console.log('UI initialization complete');
    }
    
    initializeGame() {
        // Game is already initialized in game.js
        // Just set up the connection
        if (this.game && this.game.game) {
            // Handle window resize
            window.addEventListener('resize', () => {
                this.game.handleResize();
            });
        }
    }
    
    showScreen(screenName) {
        console.log(`Showing screen: ${screenName}`);
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            console.log(`${screenName} screen is now visible`);
        } else {
            console.error(`Screen ${screenName}-screen not found!`);
        }
        
        this.currentScreen = screenName;
        
        // Update game scene visibility
        if (this.game && this.game.game) {
            if (screenName === 'game') {
                this.game.startGame();
            } else {
                this.game.stopGame();
            }
        }
    }
    
    startGame() {
        console.log('Starting game...');
        
        if (!this.game) {
            console.error('Game instance not available! Please wait for initialization to complete.');
            return;
        }
        
        if (!this.game.game) {
            console.error('Phaser game not available! Please wait for initialization to complete.');
            return;
        }
        
        // Clean up any leftover UI elements from previous games
        if (this.game && this.game.game && this.game.game.scene) {
            const gameScene = this.game.game.scene.getScene('GameScene');
            if (gameScene && gameScene.cleanupUI) {
                gameScene.cleanupUI();
            }
        }
        
        // Hide the game result area when starting a new game
        const resultArea = document.getElementById('game-result-area');
        if (resultArea) {
            resultArea.classList.add('hidden');
        }
        
        this.score = 0;
        this.gameTime = 0;
        this.phase = 1;
        this.updateUI();
        
        // Start the game scene
        console.log('Starting Phaser game scene...');
        this.game.startGame();
        
        // Wait a moment for the scene to start, then check if it's running
        setTimeout(() => {
            const gameScene = this.game.game.scene.getScene('GameScene');
            if (gameScene) {
                console.log('GameScene is running:', gameScene.scene.isActive());
            } else {
                console.error('GameScene not found!');
            }
        }, 100);
    }
    
    stopGame() {
        console.log('Stopping game...');
        
        // Clean up UI elements from the game scene
        if (this.game && this.game.game && this.game.game.scene) {
            const gameScene = this.game.game.scene.getScene('GameScene');
            if (gameScene && gameScene.cleanupUI) {
                gameScene.cleanupUI();
            }
        }
        
        if (this.game && this.game.game) {
            this.game.stopGame();
        }
    }
    
    restartGame() {
        console.log('Restarting game...');
        
        // Hide game result area
        const resultArea = document.getElementById('game-result-area');
        if (resultArea) {
            resultArea.classList.add('hidden');
        }
        
        // Show game UI
        const gameUI = document.getElementById('game-ui');
        if (gameUI) {
            gameUI.style.display = 'block';
        }
        
        // Reset game state
        this.gameTime = 0;
        this.score = 0;
        this.phase = 1;
        this.updateUI();
        
        // Clean up any existing game scene completely
        if (this.game && this.game.game && this.game.game.scene) {
            const gameScene = this.game.game.scene.getScene('GameScene');
            if (gameScene) {
                console.log('Cleaning up existing GameScene...');
                // Clean up UI elements
                if (gameScene.cleanupUI) {
                    gameScene.cleanupUI();
                }
                // Stop the scene completely
                gameScene.scene.stop();
            }
        }
        
        // Wait a moment for cleanup, then start fresh
        setTimeout(() => {
            console.log('Starting fresh game...');
            this.startGame();
        }, 100);
    }
    
    handleKeyPress(e) {
        const keyMap = {
            '1': 'amber-strike',
            '2': 'struggle-control',
            '3': 'consume-amber',
            '4': 'break-free'
        };
        
        if (keyMap[e.key]) {
            this.useAbility(keyMap[e.key]);
        }
    }
    
    useAbility(ability) {
        // This will be handled by the game scene
        if (this.game && this.game.game && this.game.game.scene) {
            const gameScene = this.game.game.scene.getScene('GameScene');
            if (gameScene) {
                gameScene.useAbility(ability);
            }
        }
    }
    
    updateUI() {
        // Update score
        const scoreElement = document.getElementById('score-value');
        const finalScoreElement = document.getElementById('final-score-value');
        if (scoreElement) scoreElement.textContent = this.score;
        if (finalScoreElement) finalScoreElement.textContent = this.score;
        
        // Update phase
        const phaseElement = document.getElementById('phase-text');
        if (phaseElement) phaseElement.textContent = `Phase ${this.phase}`;
        
        // Update timer
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            const minutes = Math.floor(this.gameTime / 60);
            const seconds = this.gameTime % 60;
            timerElement.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    updateWillpower(current, max) {
        const willpowerFill = document.getElementById('willpower-fill');
        const willpowerText = document.getElementById('willpower-text');
        const willpowerBar = document.getElementById('willpower-bar');
        
        if (willpowerFill && willpowerText && willpowerBar) {
            const percentage = (current / max) * 100;
            willpowerFill.style.width = `${percentage}%`;
            willpowerText.textContent = `${Math.floor(current)}/${Math.floor(max)}`;
            
            // Add critical warning
            if (percentage <= 20) {
                willpowerBar.classList.add('willpower-critical');
            } else {
                willpowerBar.classList.remove('willpower-critical');
            }
        }
    }
    
    gameOver(reason) {
        console.log('Game Over:', reason);
        
        // Stop the game
        this.stopGame();
        
        // Update the title screen with failure result
        const resultArea = document.getElementById('game-result-area');
        const resultMessage = document.getElementById('result-message');
        const titleScoreValue = document.getElementById('title-score-value');
        
        if (resultArea && resultMessage && titleScoreValue) {
            resultMessage.textContent = `Failed: ${reason}`;
            resultMessage.className = 'result-message failure';
            titleScoreValue.textContent = this.score;
            resultArea.classList.remove('hidden');
        }
        
        // Return to title screen
        this.showScreen('title');
    }
    
    gameSuccess(reason) {
        console.log('Game Success:', reason);
        
        // Stop the game
        this.stopGame();
        
        // Update the title screen with success result
        const resultArea = document.getElementById('game-result-area');
        const resultMessage = document.getElementById('result-message');
        const titleScoreValue = document.getElementById('title-score-value');
        
        if (resultArea && resultMessage && titleScoreValue) {
            resultMessage.textContent = `Boss Killed: ${reason}`;
            resultMessage.className = 'result-message success';
            titleScoreValue.textContent = this.score;
            resultArea.classList.remove('hidden');
        }
        
        // Return to title screen
        this.showScreen('title');
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
    }
    
    setPhase(phase) {
        this.phase = phase;
        this.updateUI();
    }
    
    updateGameTime(time) {
        this.gameTime = time;
        this.updateUI();
    }
    
    updateScore(score) {
        this.score = score;
        const scoreElement = document.getElementById('score-value');
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    window.amberShaperGame = new AmberShaperGame();
}); 