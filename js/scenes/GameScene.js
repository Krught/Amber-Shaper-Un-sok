class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.reset();
    }
    
    reset() {
        // Reset all game state variables
        this.player = null;
        this.enemies = [];
        this.amberGlobules = [];
        this.boss = null;
        this.amberMonstrosity = null;
        this.gameTime = 0;
        this.phase = 1;
        this.phaseTimer = 0;
        this.enemySpawnTimer = 0;
        this.globuleSpawnTimer = 0;
        this.score = 0;
        this.gameOver = false;
        this.spawnTimer = 0;
        this.spawnRate = 1;
        this.uiManager = null;
        this.monstrosityStacks = 0;
        this.lastMonstrosityStackTime = 0;
        this.monstrosityStackTimeout = 15000;
        this.bossHPUpdateCount = 0;
        this.amberShaperStacks = 0;
        this.lastStackTime = 0;
        this.stackTimeout = 15000;
        this.targetIndicator = null;
        this.amberSpawnTimer = 0;
        this.amberSpawnInterval = 15000;
        this.amberSpawnCount = 0;
        
        // Clear any existing event listeners
        this.clearEventListeners();
    }
    
    clearEventListeners() {
        // Remove ability button event listeners to prevent duplication
        document.querySelectorAll('.ability-btn').forEach(button => {
            // Clone the button to remove all event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
    }
    
    create() {
        console.log('GameScene create() called');
        
        // Reset scene state to ensure clean initialization
        this.reset();
        
        // Create background
        this.createBackground();
        
        // Add game status text
        // this.gameStatusText = this.add.text(10, 10, 'Game Running', {
        //     fontSize: '16px',
        //     fill: '#00ff00',
        //     backgroundColor: '#000000',
        //     padding: { x: 5, y: 5 }
        // });
        // this.gameStatusText.setScrollFactor(0);
        
        // Create player (Mutated Construct)
        this.player = new Player(this, this.cameras.main.width / 2, this.cameras.main.height / 2);
        console.log('Player created');
        
        // Initialize UI Manager
        this.uiManager = new UIManager();
        console.log('UI Manager initialized');
        
        // Create boss (Amber-Shaper Un'sok)
        this.boss = new Enemy(this, this.cameras.main.width / 2, 200, 'boss');
        console.log('Boss created with health:', this.boss.health, '/', this.boss.maxHealth);
        
        // Create Amber-Shaper UI elements
        this.createAmberShaperUI();
        
        // Create target indicator
        this.targetIndicator = this.add.graphics();
        this.targetIndicator.setDepth(10);
        
        // Create 24 different colored enemies (WoW classes)
        this.createWoWClassEnemies();
        console.log('24 WoW class enemies created');
        
        // Create initial amber globules (permanent - never despawn)
        this.createAmberGlobule();
        this.createAmberGlobule();
        this.createAmberGlobule();
        console.log('Initial permanent globules spawned');
        
        // Set up amber spawning timer
        this.amberSpawnTimer = 0;
        this.amberSpawnInterval = 15000; // 15 seconds
        this.amberSpawnCount = 0; // Track how many to spawn in current batch
        
        // Set up collision detection
        this.setupCollisions();
        
        // Start phase management
        this.startPhaseManagement();
        
        // Add some ambient effects
        this.createAmbientEffects();
        
        // Handle ability button clicks
        document.querySelectorAll('.ability-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const ability = e.currentTarget.dataset.ability;
                console.log('Ability clicked:', ability);
                
                this.useAbility(ability);
            });
        });
        
        // Add click targeting
        this.input.on('pointerdown', (pointer) => {
            // Check if the click is on a UI element (button, etc.)
            const clickedElement = document.elementFromPoint(pointer.x, pointer.y);
            console.log('Click detected at:', pointer.x, pointer.y, 'Element:', clickedElement);
            
            if (clickedElement && (
                clickedElement.tagName === 'BUTTON' || 
                clickedElement.closest('button') ||
                clickedElement.closest('.screen') ||
                clickedElement.id === 'game-over-screen' ||
                clickedElement.id === 'success-screen'
            )) {
                // This is a UI click, don't process as game click
                console.log('UI click detected, ignoring game click');
                return;
            }
            
            // This is a game click, process targeting
            console.log('Game click detected, processing targeting');
            this.handleClickTargeting(pointer.x, pointer.y);
        });
        
        // Initialize Amber-Shaper stacks system
        this.amberShaperStacks = 0;
        this.lastStackTime = 0;
        this.stackTimeout = 15000; // 15 seconds
        
        console.log('GameScene initialization complete');
    }
    
    createBackground() {
        // Create a dark, atmospheric background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x0f0f1a, 0x0f0f1a, 0x1a1a2e, 0x1a1a2e, 1);
        graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // Add some ambient lighting
        const ambientLight = this.add.graphics();
        ambientLight.fillStyle(0xffffff, 0.05);
        ambientLight.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // Add some ground texture
        const ground = this.add.graphics();
        ground.fillStyle(0x2a2a3a, 0.3);
        ground.fillRect(0, this.cameras.main.height - 50, this.cameras.main.width, 50);
    }
    
    setupCollisions() {
        // Player collision with enemies
        this.physics.add.overlap(this.player.sprite, this.enemies.map(e => e.sprite), (player, enemy) => {
            const enemyObj = this.enemies.find(e => e.sprite === enemy);
            if (enemyObj && enemyObj.isAttacking) {
                this.player.takeDamage(10);
            }
        });
        
        // Enemy collision with globules (only for construct consumption)
        this.physics.add.overlap(this.enemies.map(e => e.sprite), this.amberGlobules.map(g => g.sprite), (enemy, globule) => {
            const enemyObj = this.enemies.find(e => e.sprite === enemy);
            const globuleObj = this.amberGlobules.find(g => g.sprite === globule);
            if (enemyObj && globuleObj && enemyObj.type === 'construct') {
                enemyObj.consumeGlobule(globuleObj);
            }
        });
    }
    
    startPhaseManagement() {
        // Phase 1: Basic mechanics introduction
        this.phase = 1;
        this.phaseTimer = 0;
        
        // Update UI
        if (window.amberShaperGame) {
            window.amberShaperGame.setPhase(this.phase);
        }
    }
    
    createAmbientEffects() {
        // Create simple ambient lighting effect
        const ambientLight = this.add.graphics();
        ambientLight.fillStyle(0xffffff, 0.02);
        ambientLight.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // Add some floating amber elements
        this.createFloatingAmberElements();
    }
    
    createFloatingAmberElements() {
        for (let i = 0; i < 5; i++) {
            this.createFloatingAmberElement();
        }
    }
    
    createFloatingAmberElement() {
        const element = this.add.graphics();
        element.fillStyle(0xffd700, 0.3);
        element.fillCircle(0, 0, 2);
        
        element.x = Phaser.Math.Between(0, this.cameras.main.width);
        element.y = this.cameras.main.height + 10;
        
        this.tweens.add({
            targets: element,
            y: element.y - 80,
            alpha: 0,
            duration: Phaser.Math.Between(4000, 8000),
            ease: 'Sine.easeInOut',
            onComplete: () => {
                element.destroy();
                this.createFloatingAmberElement();
            }
        });
    }
    
    update(time, delta) {
        if (this.gameOver) return;
        
        // Update game time
        this.gameTime += delta / 1000;
        
        // Update game status text
        // if (this.gameStatusText) {
        //     this.gameStatusText.setText(`Game Running - Time: ${Math.floor(this.gameTime)}s - Phase: ${this.phase}`);
        // }
        
        // Update UI every second to avoid spam
        if (Math.floor(this.gameTime) % 1 === 0) {
            if (window.amberShaperGame) {
                window.amberShaperGame.updateGameTime(Math.floor(this.gameTime));
                window.amberShaperGame.updateWillpower(this.player.willpower, this.player.maxWillpower);
            }
        }
        
        // Update player
        if (this.player) {
            this.player.update(time, delta);
        }
        
        // Update enemies
        let updatedEnemies = 0;
        this.enemies.forEach(enemy => {
            if (enemy && enemy.sprite && enemy.sprite.active) {
                enemy.update(delta);
                updatedEnemies++;
            }
        });
        
        // Debug logging for enemy updates
        if (updatedEnemies > 0 && this.gameTime % 5 < 0.1) { // Log every 5 seconds
            console.log(`Updated ${updatedEnemies} enemies, total enemies: ${this.enemies.length}`);
        }
        
        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => 
            enemy && enemy.sprite && enemy.sprite.active && enemy.health > 0
        );
        
        // Update amber globules
        this.amberGlobules.forEach(globule => {
            globule.update(delta);
        });
        
        // Update UI
        if (this.uiManager) {
            this.uiManager.update(this.player);
            this.uiManager.updateAbilityButtons(this.player);
            
            // Update cast bar if player is casting Amber Explosion
            if (this.player && this.player.castingAmberExplosion) {
                const castProgress = (this.player.amberExplosionCastTime / this.player.amberExplosionCastDuration) * 100;
                this.uiManager.updateCastBar(true, castProgress);
            } else {
                this.uiManager.updateCastBar(false);
            }
        }
        
        // Update Amber-Shaper stacks
        this.updateAmberShaperStacks();
        
        // Update Monstrosity stacks
        this.updateMonstrosityStacks();
        
        // Update amber spawning
        this.updateAmberSpawning(delta);
        
        // Update boss HP bar
        this.updateBossHPBar();
        
        // Update Amber Monstrosity HP bar
        this.updateMonstrosityHPBar();
        
        // Debug: Check if boss health is being modified unexpectedly
        if (this.boss && this.boss.health <= 100) {
            console.log(`Update loop - Boss health: ${this.boss.health}/${this.boss.maxHealth}`);
        }
        
        // Update score
        if (window.amberShaperGame) {
            const currentScore = Math.floor(this.gameTime * 10) + (this.player.damageDealt * 5);
            window.amberShaperGame.updateScore(currentScore);
        }
        
        // Update target indicator
        this.updateTargetIndicator();
        
        // Phase management
        this.updatePhase(delta);
        
        // Spawn management - DISABLED: No additional enemies spawn after game start
        // this.updateSpawns(delta);
        
        // Check game over conditions
        this.checkGameOver();
    }
    
    updateGameTime(time) {
        this.gameTime = time;
        if (this.uiManager) {
            this.uiManager.updateTimer(time);
        }
    }
    
    updateWillpower(current, max) {
        if (this.uiManager) {
            this.uiManager.updateWillpower(current, max);
        }
    }
    
    updatePhase(delta) {
        // Phase transitions based on boss health percentage
        if (this.boss && this.phase === 1) {
            const bossHealthPercent = (this.boss.health / this.boss.maxHealth) * 100;
            
            if (bossHealthPercent <= 70) {
                this.phase = 2;
                this.startPhase2();
            }
        } else if (this.boss && this.phase === 2) {
            const bossHealthPercent = (this.boss.health / this.boss.maxHealth) * 100;
            
            if (bossHealthPercent <= 30) {
                this.phase = 3;
                this.startPhase3();
            }
        }
    }
    
    startPhase2() {
        console.log('Phase 2 started - Boss health at 70% or below');
        
        // Spawn Amber Monstrosity
        this.spawnAmberMonstrosity();
        
        // Update UI
        if (window.amberShaperGame) {
            window.amberShaperGame.setPhase(this.phase);
        }
        
        // Show phase transition message
        this.showPhaseTransitionMessage('Phase 2: The Amber-Shaper summons an Amber Monstrosity!');
    }
    
    startPhase3() {
        console.log('Phase 3 started - Boss health at 30% or below');
        
        // Update UI
        if (window.amberShaperGame) {
            window.amberShaperGame.setPhase(this.phase);
        }
        
        // Show phase transition message
        this.showPhaseTransitionMessage('Phase 3: The Amber-Shaper enters his final form!');
    }
    
    // DISABLED: No additional enemies spawn after game start
    /*
    updateSpawns(delta) {
        this.spawnTimer += delta / 1000;
        
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }
    }
    
    spawnEnemy() {
        const x = Phaser.Math.Between(50, this.cameras.main.width - 50);
        const y = Phaser.Math.Between(50, this.cameras.main.height - 50);
        const enemy = new Enemy(this, x, y);
        this.enemies.push(enemy);
    }
    
    spawnEnemyConstructs(count) {
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
            const y = Phaser.Math.Between(100, this.cameras.main.height - 100);
            const enemy = new Enemy(this, x, y, 'construct');
            this.enemies.push(enemy);
        }
    }
    */
    
    createAmberGlobule() {
        const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
        const y = Phaser.Math.Between(100, this.cameras.main.height - 100);
        const globule = new AmberGlobule(this, x, y);
        this.amberGlobules.push(globule);
    }
    
    checkGameOver() {
        // Check if player went berserk (willpower = 0)
        if (this.player && this.player.willpower <= 0) {
            this.endGame('You went berserk! The raid leader called wipe. The raid leader is strongly disappointed in you.');
            return;
        }
        
        // Check if boss is defeated
        if (this.boss && this.boss.health <= 0) {
            console.log('Boss defeated! Health:', this.boss.health, 'Max health:', this.boss.maxHealth);
            this.endGame('Victory! You defeated Amber-Shaper Un\'sok!');
            return;
        }
        
        // Check if too many enemies are berserk
        const berserkEnemies = this.enemies.filter(enemy => enemy.isBerserk).length;
        if (berserkEnemies >= 3) {
            this.endGame('Too many constructs went berserk! The raid leader called wipe. The raid leader is strongly disappointed in you.');
            return;
        }
    }
    
    endGame(reason) {
        this.gameOver = true;
        
        // Calculate final score
        this.score = Math.floor(this.gameTime * 10) + (this.player.damageDealt * 5);
        
        // Update UI
        if (window.amberShaperGame) {
            window.amberShaperGame.addScore(this.score);
            window.amberShaperGame.gameOver(reason);
        } else {
            // Fallback if main game instance is not available
            this.showFallbackGameOver(reason);
        }
        
        console.log('Game ended:', reason);
    }
    
    showFallbackGameOver(reason) {
        // Create fallback game over screen
        const gameOverScreen = document.createElement('div');
        gameOverScreen.id = 'fallback-game-over';
        gameOverScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        gameOverScreen.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h1 style="color: #ff0000; margin-bottom: 20px;">Game Over</h1>
                <p style="font-size: 18px; margin-bottom: 30px;">${reason}</p>
                <button onclick="location.reload()" style="
                    padding: 15px 30px;
                    font-size: 16px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Restart Game</button>
            </div>
        `;
        
        document.body.appendChild(gameOverScreen);
    }
    
    endGameSuccess(reason) {
        this.gameOver = true;
        
        // Calculate final score
        this.score = Math.floor(this.gameTime * 10) + (this.player.damageDealt * 5);
        
        // Update UI
        if (window.amberShaperGame) {
            window.amberShaperGame.addScore(this.score);
            window.amberShaperGame.gameSuccess(reason);
        } else {
            // Fallback if main game instance is not available
            this.showFallbackSuccess(reason);
        }
        
        console.log('Game ended successfully:', reason);
    }
    
    showFallbackSuccess(reason) {
        // Create fallback success screen
        const successScreen = document.createElement('div');
        successScreen.id = 'fallback-success';
        successScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        successScreen.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h1 style="color: #4CAF50; margin-bottom: 20px;">Success!</h1>
                <p style="font-size: 18px; margin-bottom: 30px;">${reason}</p>
                <p style="font-size: 16px; margin-bottom: 30px;">Final Score: ${this.score}</p>
                <button onclick="location.reload()" style="
                    padding: 15px 30px;
                    font-size: 16px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Play Again</button>
            </div>
        `;
        
        document.body.appendChild(successScreen);
    }
    
    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        
        // Handle Amber Monstrosity death
        if (enemy === this.amberMonstrosity) {
            this.onAmberMonstrosityDeath();
        }
    }
    
    onAmberMonstrosityDeath() {
        console.log('Amber Monstrosity defeated! Boss damage reduction removed.');
        this.amberMonstrosity = null;
        
        // Make all 24 WoW class enemies target the boss again
        this.enemies.forEach(enemy => {
            if (enemy.type === 'wow-class') {
                enemy.target = this.boss;
                console.log(`${enemy.wowClass?.name || 'WoW Class'} now targeting boss again`);
            }
        });
        
        // Remove UI elements
        const monstrosityHPBar = document.querySelector('.monstrosity-hp-bar');
        const monstrosityStacksContainer = document.querySelector('.monstrosity-stacks-container');
        
        if (monstrosityHPBar) {
            monstrosityHPBar.remove();
        }
        if (monstrosityStacksContainer) {
            monstrosityStacksContainer.remove();
        }
        
        // Show message
        this.showPhaseTransitionMessage('Amber Monstrosity Defeated! Boss is vulnerable again!');
    }
    
    removeGlobule(globule) {
        const index = this.amberGlobules.indexOf(globule);
        if (index > -1) {
            this.amberGlobules.splice(index, 1);
        }
    }
    
    useAbility(ability) {
        if (this.gameOver || !this.player) return;
        
        console.log('GameScene useAbility called:', ability);
        
        switch(ability) {
            case 'amber-strike':
                this.player.useAmberStrike();
                // Check if target is boss and add stack (only if ability was actually used)
                if (this.player.target === this.boss && this.player.lastAbilityUsed === 'amber-strike') {
                    this.addAmberShaperStack();
                }
                break;
            case 'struggle-control':
                this.player.useStruggleForControl();
                break;
            case 'consume-amber':
                this.player.useConsumeAmber();
                break;
            case 'break-free':
                this.player.useBreakFree();
                break;
        }
    }
    
    handleClickTargeting(x, y) {
        console.log(`Click at: ${x}, ${y}`);
        
        // Only allow targeting the boss
        if (this.boss && this.boss.sprite) {
            const bossDistance = Phaser.Math.Distance.Between(x, y, this.boss.sprite.x, this.boss.sprite.y);
            console.log(`Boss distance: ${bossDistance}, Boss position: ${this.boss.sprite.x}, ${this.boss.sprite.y}`);
            if (bossDistance <= 35) { // Slightly larger radius for easier targeting
                this.player.target = this.boss;
                console.log('Targeted boss successfully');
                return;
            }
        }
        
        // If clicked on nothing or on WoW class enemies (friendlies), clear target
        this.player.target = null;
        console.log('Cleared target - clicked on empty space or friendly');
    }
    
    updateTargetIndicator() {
        if (this.player && this.player.target) {
            const targetPosition = this.player.target.sprite.getCenter();
            const playerPosition = this.player.sprite.getCenter();
            
            this.targetIndicator.clear();
            this.targetIndicator.lineStyle(2, 0xff0000, 1);
            this.targetIndicator.strokeCircle(targetPosition.x, targetPosition.y, 20); // 20px radius
            
            // Draw a line from player to target
            this.targetIndicator.lineStyle(1, 0xff0000, 0.5);
            this.targetIndicator.moveTo(playerPosition.x, playerPosition.y);
            this.targetIndicator.lineTo(targetPosition.x, targetPosition.y);
        } else {
            this.targetIndicator.clear();
        }
    }
    
    updateAmberShaperStacks() {
        const currentTime = this.time.now;
        
        // Check if stacks should reset (15 seconds timeout)
        if (this.amberShaperStacks > 0 && (currentTime - this.lastStackTime) > this.stackTimeout) {
            this.amberShaperStacks = 0;
            this.showStacksResetMessage();
            this.updateStacksDisplay();
        }
    }
    
    updateMonstrosityStacks() {
        const currentTime = this.time.now;
        
        // Check if stacks should reset (15 seconds timeout)
        if (this.monstrosityStacks > 0 && (currentTime - this.lastMonstrosityStackTime) > this.monstrosityStackTimeout) {
            this.monstrosityStacks = 0;
            this.showMonstrosityStacksResetMessage();
            this.updateMonstrosityStacksDisplay();
        }
    }
    
    updateMonstrosityStacksDisplay() {
        const monstrosityStacksCounter = document.getElementById('monstrosity-stacks-counter');
        const monstrosityStacksTimer = document.getElementById('monstrosity-stacks-timer');
        
        if (monstrosityStacksCounter) {
            monstrosityStacksCounter.textContent = this.monstrosityStacks;
        }
        
        if (monstrosityStacksTimer) {
            if (this.monstrosityStacks > 0) {
                const timeRemaining = Math.max(0, Math.ceil((this.monstrosityStackTimeout - (this.time.now - this.lastMonstrosityStackTime)) / 1000));
                monstrosityStacksTimer.textContent = `${timeRemaining}s`;
            } else {
                monstrosityStacksTimer.textContent = '15s';
            }
        }
    }
    
    addAmberShaperStack() {
        this.amberShaperStacks++;
        this.lastStackTime = this.time.now;
        this.updateStacksDisplay();
        console.log(`Amber-Shaper stacks: ${this.amberShaperStacks}`);
    }
    
    addMonstrosityStack() {
        this.monstrosityStacks++;
        this.lastMonstrosityStackTime = this.time.now;
        this.updateMonstrosityStacksDisplay();
        console.log(`Monstrosity stacks: ${this.monstrosityStacks}`);
    }
    
    updateStacksDisplay() {
        const stacksCounter = document.getElementById('amber-shaper-stacks-counter');
        const stacksTimer = document.getElementById('amber-shaper-stacks-timer');
        
        if (stacksCounter) {
            stacksCounter.textContent = this.amberShaperStacks;
        }
        
        if (stacksTimer) {
            if (this.amberShaperStacks > 0) {
                const timeRemaining = Math.max(0, Math.ceil((this.stackTimeout - (this.time.now - this.lastStackTime)) / 1000));
                stacksTimer.textContent = `${timeRemaining}s`;
            } else {
                stacksTimer.textContent = '15s';
            }
        }
    }
    
    showStacksResetMessage() {
        const message = document.createElement('div');
        message.className = 'stacks-reset-message';
        message.textContent = 'Amber-Shaper Stacks Reset!';
        document.body.appendChild(message);
        
        // Remove message after animation
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
    
    showMonstrosityStacksResetMessage() {
        const message = document.createElement('div');
        message.className = 'monstrosity-stacks-reset-message';
        message.textContent = 'Monstrosity Stacks Reset!';
        document.body.appendChild(message);
        
        // Remove message after animation
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }

    createWoWClassEnemies() {
        const wowClasses = [
            { name: 'Death Knight', color: 0xC41E3A },
            { name: 'Druid', color: 0xFF7C0A },
            { name: 'Hunter', color: 0xAAD372 },
            { name: 'Mage', color: 0x3FC7EB },
            { name: 'Monk', color: 0x00FF98 },
            { name: 'Paladin', color: 0xF48CBA },
            { name: 'Priest', color: 0xFFFFFF },
            { name: 'Rogue', color: 0xFFF468 },
            { name: 'Shaman', color: 0x0070DD },
            { name: 'Warrior', color: 0xC69B6D },
            { name: 'Warlock', color: 0x8788EE }
        ].map(cls => ({
            ...cls,
            // Random damage between 12 and 32
            damage: Phaser.Math.Between(12, 32),
            // Keep the original range logic
            range: (cls.name === 'Hunter') ? 420 :
                   (cls.name === 'Mage') ? 360 :
                   (cls.name === 'Druid' || cls.name === 'Priest' || cls.name === 'Warlock') ? 300 :
                   (cls.name === 'Shaman') ? 240 :
                   (cls.name === 'Monk' || cls.name === 'Rogue') ? 60 :
                   120,
            // Random speed between 1.5 and 4.5 seconds
            speed: +(Phaser.Math.FloatBetween(1.5, 4.5).toFixed(2))
        }));
        
        // Separate classes into melee and ranged
        const meleeClasses = wowClasses.filter(cls => cls.range < 240); // Adjusted range for melee
        const rangedClasses = wowClasses.filter(cls => cls.range >= 240); // Adjusted range for ranged
        
        console.log(`Melee classes: ${meleeClasses.length}, Ranged classes: ${rangedClasses.length}`);
        
        // Ensure we have 5-15 ranged attackers
        const minRanged = 5;
        const maxRanged = 15;
        const targetRangedCount = Phaser.Math.Between(minRanged, maxRanged);
        
        // Calculate how many of each class type we need
        const rangedNeeded = targetRangedCount;
        const meleeNeeded = 24 - rangedNeeded;
        
        console.log(`Target: ${rangedNeeded} ranged, ${meleeNeeded} melee out of 24 total`);
        
        // Create enemies with proper distribution
        this.enemies = [];
        
        // Create ranged enemies
        for (let i = 0; i < rangedNeeded; i++) {
            const classIndex = i % rangedClasses.length;
            const wowClass = rangedClasses[classIndex];
            
            // Position ranged enemies at their attack range distance
            const angle = (i / rangedNeeded) * Math.PI * 2;
            const radius = wowClass.range + Math.random() * 100; // Spawn at their attack range + some variance
            const x = this.cameras.main.width / 2 + Math.cos(angle) * radius;
            const y = this.cameras.main.height / 2 + Math.sin(angle) * radius;
            
            const enemy = new Enemy(this, x, y, 'wow-class', wowClass, true); // true = ranged
            this.enemies.push(enemy);
        }
        
        // Create melee enemies
        for (let i = 0; i < meleeNeeded; i++) {
            const classIndex = i % meleeClasses.length;
            const wowClass = meleeClasses[classIndex];
            
            // Position melee enemies closer to the boss
            const angle = (i / meleeNeeded) * Math.PI * 2;
            const radius = 100 + Math.random() * 50; // Spawn closer to boss
            const x = this.cameras.main.width / 2 + Math.cos(angle) * radius;
            const y = this.cameras.main.height / 2 + Math.sin(angle) * radius;
            
            const enemy = new Enemy(this, x, y, 'wow-class', wowClass, false); // false = melee
            this.enemies.push(enemy);
        }
        
        console.log(`Created ${this.enemies.length} enemies: ${rangedNeeded} ranged, ${meleeNeeded} melee`);
    }

    updateAmberSpawning(delta) {
        this.amberSpawnTimer += delta / 1000;
        
        // Check if it's time to start a new spawn cycle
        if (this.amberSpawnTimer >= this.amberSpawnInterval && this.amberSpawnCount === 0) {
            this.amberSpawnTimer = 0;
            this.amberSpawnCount = 3; // Spawn 3 globules
            this.spawnAmberBatch();
        }
    }
    
    spawnAmberBatch() {
        if (this.amberSpawnCount > 0) {
            this.createAmberGlobule();
            this.amberSpawnCount--;
            
            // Schedule next spawn in 1 second if there are more to spawn
            if (this.amberSpawnCount > 0) {
                this.time.delayedCall(1000, () => {
                    this.spawnAmberBatch();
                });
            }
        }
    }

    updateBossHPBar() {
        this.bossHPUpdateCount++;
        
        if (this.boss) {
            const bossHPFill = document.querySelector('.amber-shaper-hp-fill');
            const bossHPText = document.querySelector('.amber-shaper-hp-text');
            
            // Debug logging
            if (this.gameTime % 2 < 0.1) { // Log every 2 seconds
                console.log(`=== BOSS HP UPDATE #${this.bossHPUpdateCount} ===`);
                console.log(`Boss health: ${this.boss.health}/${this.boss.maxHealth}`);
                console.log(`HP Fill element found: ${!!bossHPFill}`);
                console.log(`HP Text element found: ${!!bossHPText}`);
                if (bossHPFill) {
                    console.log(`Current HP Fill width: ${bossHPFill.style.width}`);
                    console.log(`Current HP Fill computed width: ${window.getComputedStyle(bossHPFill).width}`);
                }
                if (bossHPText) {
                    console.log(`Current HP Text content: ${bossHPText.textContent}`);
                }
            }
            
            if (bossHPFill && bossHPText) {
                const healthPercent = (this.boss.health / this.boss.maxHealth) * 100;
                
                // Debug the calculation
                if (this.gameTime % 2 < 0.1) {
                    console.log(`Health calculation: ${this.boss.health} / ${this.boss.maxHealth} * 100 = ${healthPercent}%`);
                    console.log(`Setting width to: ${healthPercent}%`);
                    console.log(`Element still in DOM: ${document.body.contains(bossHPFill)}`);
                }
                
                // Set the width with explicit percentage
                bossHPFill.style.width = `${healthPercent}%`;
                // Also set it as an attribute for redundancy
                bossHPFill.setAttribute('style', `width: ${healthPercent}%; height: 100%; background: ${bossHPFill.style.background}; border-radius: 8px;`);
                
                // Debug: Check if width was actually set
                if (this.gameTime % 2 < 0.1) {
                    console.log(`After setting width, element width is: ${bossHPFill.style.width}`);
                    console.log(`Computed width: ${window.getComputedStyle(bossHPFill).width}`);
                }
                
                // Show damage reduction when Amber Monstrosity is alive
                const damageReductionText = this.amberMonstrosity && this.amberMonstrosity.health > 0 ? ' (99% Damage Reduction)' : '';
                const newText = `Amber-Shaper Un'sok: ${Math.floor(this.boss.health)}/${Math.floor(this.boss.maxHealth)}${damageReductionText}`;
                bossHPText.textContent = newText;
                
                if (this.gameTime % 2 < 0.1) {
                    console.log(`Setting text to: ${newText}`);
                    console.log(`Text after setting: ${bossHPText.textContent}`);
                }
                
                // Debug logging for low boss health
                if (this.boss.health <= 100) {
                    console.log(`Boss health low: ${this.boss.health}/${this.boss.maxHealth} (${healthPercent.toFixed(1)}%)`);
                }
                
                // Change color based on health percentage
                if (healthPercent > 60) {
                    bossHPFill.style.background = 'linear-gradient(to right, #ff0000, #ff6666)';
                } else if (healthPercent > 30) {
                    bossHPFill.style.background = 'linear-gradient(to right, #ff6600, #ffaa66)';
                } else {
                    bossHPFill.style.background = 'linear-gradient(to right, #ff0000, #ff3333)';
                }
                
                // Force a reflow to ensure the width change is applied
                bossHPFill.offsetHeight;
            } else {
                // Debug logging when elements are not found
                if (this.gameTime % 2 < 0.1) { // Log every 2 seconds
                    console.log('Boss HP UI elements not found!');
                    console.log('Available elements with similar classes:');
                    document.querySelectorAll('[class*="hp"]').forEach(el => {
                        console.log(`- ${el.className}`);
                    });
                }
            }
        }
    }
    
    updateMonstrosityHPBar() {
        if (this.amberMonstrosity) {
            const monstrosityHPFill = document.querySelector('.monstrosity-hp-fill');
            const monstrosityHPText = document.querySelector('.monstrosity-hp-text');
            
            if (monstrosityHPFill && monstrosityHPText) {
                const healthPercent = (this.amberMonstrosity.health / this.amberMonstrosity.maxHealth) * 100;
                monstrosityHPFill.style.width = `${healthPercent}%`;
                monstrosityHPText.textContent = `Amber Monstrosity: ${Math.floor(this.amberMonstrosity.health)}/${Math.floor(this.amberMonstrosity.maxHealth)}`;
                
                // Change color based on health percentage
                if (healthPercent > 60) {
                    monstrosityHPFill.style.background = 'linear-gradient(to right, #ff6600, #ffaa00)';
                } else if (healthPercent > 30) {
                    monstrosityHPFill.style.background = 'linear-gradient(to right, #ff4400, #ff8800)';
                } else {
                    monstrosityHPFill.style.background = 'linear-gradient(to right, #ff2200, #ff6600)';
                }
            }
        }
    }

    showPhaseTransitionMessage(message) {
        // Create phase transition message
        const phaseMessage = document.createElement('div');
        phaseMessage.className = 'phase-transition-message';
        phaseMessage.textContent = message;
        phaseMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #ffd700;
            font-size: 24px;
            font-weight: bold;
            padding: 20px 40px;
            border: 2px solid #ffd700;
            border-radius: 10px;
            z-index: 10000;
            text-align: center;
            animation: phaseTransition 3s ease-in-out forwards;
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes phaseTransition {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(phaseMessage);
        
        // Remove message after animation
        setTimeout(() => {
            if (phaseMessage.parentNode) {
                phaseMessage.parentNode.removeChild(phaseMessage);
            }
        }, 3000);
    }
    
    spawnAmberMonstrosity() {
        // Create Amber Monstrosity at a random position near the boss
        const x = this.cameras.main.width / 2 + Phaser.Math.Between(-100, 100);
        const y = this.cameras.main.height / 2 + Phaser.Math.Between(-100, 100);
        
        this.amberMonstrosity = new Enemy(this, x, y, 'amber-monstrosity');
        console.log('Amber Monstrosity spawned with health:', this.amberMonstrosity.health, '/', this.amberMonstrosity.maxHealth);
        
        // Make all 24 WoW class enemies target the Amber Monstrosity
        this.enemies.forEach(enemy => {
            if (enemy.type === 'wow-class') {
                enemy.target = this.amberMonstrosity;
                console.log(`${enemy.wowClass?.name || 'WoW Class'} now targeting Amber Monstrosity`);
            }
        });
        
        // Create UI elements for Amber Monstrosity
        this.createAmberMonstrosityUI();
    }
    
    createAmberMonstrosityUI() {
        // Create HP bar for Amber Monstrosity
        const monstrosityHPBar = document.createElement('div');
        monstrosityHPBar.className = 'monstrosity-hp-bar';
        monstrosityHPBar.style.cssText = `
            position: fixed;
            top: 120px;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 20px;
            background: #333;
            border: 2px solid #666;
            border-radius: 10px;
            z-index: 1000;
        `;
        
        const monstrosityHPFill = document.createElement('div');
        monstrosityHPFill.className = 'monstrosity-hp-fill';
        monstrosityHPFill.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(to right, #ff6600, #ffaa00);
            border-radius: 8px;
            transition: width 0.3s ease;
        `;
        
        const monstrosityHPText = document.createElement('div');
        monstrosityHPText.className = 'monstrosity-hp-text';
        monstrosityHPText.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-weight: bold;
            font-size: 12px;
            text-shadow: 1px 1px 2px black;
        `;
        monstrosityHPText.textContent = 'Amber Monstrosity: 10000/10000';
        
        monstrosityHPBar.appendChild(monstrosityHPFill);
        monstrosityHPBar.appendChild(monstrosityHPText);
        document.body.appendChild(monstrosityHPBar);
        
        // Create stacks counter for Amber Monstrosity (1/2 size of original)
        const monstrosityStacksContainer = document.createElement('div');
        monstrosityStacksContainer.className = 'monstrosity-stacks-container';
        monstrosityStacksContainer.style.cssText = `
            position: fixed;
            top: 150px;
            left: 50%;
            transform: translateX(-50%);
            width: 150px;
            height: 30px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #ff6600;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px;
            z-index: 1000;
        `;
        
        const monstrosityStacksLabel = document.createElement('div');
        monstrosityStacksLabel.textContent = 'Monstrosity Stacks:';
        monstrosityStacksLabel.style.cssText = `
            color: #ff6600;
            font-size: 10px;
            font-weight: bold;
        `;
        
        const monstrosityStacksCounter = document.createElement('div');
        monstrosityStacksCounter.id = 'monstrosity-stacks-counter';
        monstrosityStacksCounter.textContent = '0';
        monstrosityStacksCounter.style.cssText = `
            color: #ffaa00;
            font-size: 12px;
            font-weight: bold;
        `;
        
        const monstrosityStacksTimer = document.createElement('div');
        monstrosityStacksTimer.id = 'monstrosity-stacks-timer';
        monstrosityStacksTimer.textContent = '15s';
        monstrosityStacksTimer.style.cssText = `
            color: #ffaa00;
            font-size: 10px;
        `;
        
        monstrosityStacksContainer.appendChild(monstrosityStacksLabel);
        monstrosityStacksContainer.appendChild(monstrosityStacksCounter);
        monstrosityStacksContainer.appendChild(monstrosityStacksTimer);
        document.body.appendChild(monstrosityStacksContainer);
    }
    
    createAmberShaperUI() {
        console.log('Creating Amber-Shaper UI...');
        console.log('Boss health at UI creation:', this.boss.health, '/', this.boss.maxHealth);
        
        // Create HP bar for Amber-Shaper
        const amberShaperHPBar = document.createElement('div');
        amberShaperHPBar.className = 'amber-shaper-hp-bar';
        amberShaperHPBar.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 20px;
            background: #333;
            border: 2px solid #666;
            border-radius: 10px;
            z-index: 1000;
        `;
        
        const amberShaperHPFill = document.createElement('div');
        amberShaperHPFill.className = 'amber-shaper-hp-fill';
        const initialHealthPercent = (this.boss.health / this.boss.maxHealth) * 100;
        amberShaperHPFill.style.cssText = `
            width: ${initialHealthPercent}%;
            height: 100%;
            background: linear-gradient(to right, #ff0000, #ff6666);
            border-radius: 8px;
        `;
        
        console.log(`Initial HP bar width set to: ${initialHealthPercent}%`);
        
        const amberShaperHPText = document.createElement('div');
        amberShaperHPText.className = 'amber-shaper-hp-text';
        amberShaperHPText.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-weight: bold;
            font-size: 12px;
            text-shadow: 1px 1px 2px black;
        `;
        amberShaperHPText.textContent = `Amber-Shaper Un'sok: ${Math.floor(this.boss.health)}/${Math.floor(this.boss.maxHealth)}`;
        
        amberShaperHPBar.appendChild(amberShaperHPFill);
        amberShaperHPBar.appendChild(amberShaperHPText);
        document.body.appendChild(amberShaperHPBar);
        
        console.log('Amber-Shaper HP bar created and added to DOM');
        
        // Create stacks counter for Amber-Shaper (1/2 size of original)
        const amberShaperStacksContainer = document.createElement('div');
        amberShaperStacksContainer.className = 'amber-shaper-stacks-container';
        amberShaperStacksContainer.style.cssText = `
            position: fixed;
            top: 110px;
            left: 50%;
            transform: translateX(-50%);
            width: 150px;
            height: 30px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #ffd700;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px;
            z-index: 1000;
        `;
        
        const amberShaperStacksLabel = document.createElement('div');
        amberShaperStacksLabel.textContent = 'Amber-Shaper Stacks:';
        amberShaperStacksLabel.style.cssText = `
            color: #ffd700;
            font-size: 10px;
            font-weight: bold;
        `;
        
        const amberShaperStacksCounter = document.createElement('div');
        amberShaperStacksCounter.id = 'amber-shaper-stacks-counter';
        amberShaperStacksCounter.textContent = '0';
        amberShaperStacksCounter.style.cssText = `
            color: #ffd700;
            font-size: 12px;
            font-weight: bold;
        `;
        
        const amberShaperStacksTimer = document.createElement('div');
        amberShaperStacksTimer.id = 'amber-shaper-stacks-timer';
        amberShaperStacksTimer.textContent = '15s';
        amberShaperStacksTimer.style.cssText = `
            color: #ffd700;
            font-size: 10px;
        `;
        
        amberShaperStacksContainer.appendChild(amberShaperStacksLabel);
        amberShaperStacksContainer.appendChild(amberShaperStacksCounter);
        amberShaperStacksContainer.appendChild(amberShaperStacksTimer);
        document.body.appendChild(amberShaperStacksContainer);
        
        console.log('Amber-Shaper stacks container created and added to DOM');
    }
    
    cleanupUI() {
        console.log('Cleaning up game UI elements...');
        
        // Clean up UIManager elements
        if (this.uiManager) {
            this.uiManager.cleanup();
        }
        
        // Remove boss HP bars and stacks
        const elementsToRemove = [
            '.amber-shaper-hp-bar',
            '.amber-shaper-stacks-container',
            '.monstrosity-hp-bar',
            '.monstrosity-stacks-container',
            '.phase-transition-message',
            '.stacks-reset-message',
            '.monstrosity-stacks-reset-message',
            '.fallback-game-over',
            '.fallback-success'
        ];
        
        elementsToRemove.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                console.log(`Removing element: ${selector}`);
                element.remove();
            });
        });
        
        // Also remove any dynamically created game over or success screens
        const gameOverScreens = document.querySelectorAll('[id*="game-over"]');
        const successScreens = document.querySelectorAll('[id*="success"]');
        
        gameOverScreens.forEach(screen => {
            if (screen.classList.contains('fallback-game-over')) {
                screen.remove();
            }
        });
        
        successScreens.forEach(screen => {
            if (screen.classList.contains('fallback-success')) {
                screen.remove();
            }
        });
        
        console.log('Game UI cleanup complete');
    }
    
    shutdown() {
        console.log('GameScene shutdown - cleaning up UI and state...');
        
        // Clean up UI elements
        this.cleanupUI();
        
        // Clear event listeners
        this.clearEventListeners();
        
        // Reset scene state
        this.reset();
        
        // Call parent shutdown
        super.shutdown();
    }
} 