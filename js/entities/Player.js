class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // Willpower system
        this.maxWillpower = 100;
        this.willpower = 100;
        this.willpowerDrainRate = 2; // points per second
        
        // Combat stats
        this.health = 100;
        this.maxHealth = 100;
        this.damageDealt = 0;
        
        // Ability cooldowns
        this.cooldowns = {
            'amber-strike': 0,
            'struggle-control': 0,
            'consume-amber': 0,
            'break-free': 0
        };
        
        this.cooldownTimes = {
            'amber-strike': 6,
            'struggle-control': 6,
            'consume-amber': 1.5,
            'break-free': 0
        };
        
        // Ability costs
        this.abilityCosts = {
            'amber-strike': 0,
            'struggle-control': 8,
            'consume-amber': 0,
            'break-free': 0
        };
        
        // Amber Explosion casting mechanics
        this.castingAmberExplosion = false;
        this.amberExplosionCastTime = 0;
        this.amberExplosionCastDuration = 3000; // 3 seconds
        this.amberExplosionTimer = 0;
        this.amberExplosionInterval = 15000; // Cast every 15 seconds
        this.amberExplosionCooldown = 0; // 6-second cooldown after interrupt
        
        // Break Free mechanics
        this.canBreakFree = false;
        
        // State
        this.isAttacking = false;
        this.isBerserk = false;
        this.attackCooldown = 0;
        this.berserkTimer = 0;
        this.behaviorTimer = 0;
        this.lastAbilityUsed = null; // Track last successfully used ability
        
        // Create sprite as a blue circle
        this.sprite = this.scene.add.circle(x, y, 20, 0x0066ff);
        this.sprite.setStrokeStyle(2, 0x0044cc);
        
        // Add physics body
        this.scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);
        
        // Movement
        this.moveSpeed = 200;
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys('W,S,A,D');
        
        // Target system
        this.target = null;
        this.targetRange = 150;
        
        // Visual effects
        this.createEffects();
        
        // Debuff system
        this.debuffs = {};
    }
    
    createSprite() {
        // Create a simple construct sprite
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xffd700);
        graphics.fillCircle(0, 0, 20);
        graphics.lineStyle(3, 0xff6b35);
        graphics.strokeCircle(0, 0, 20);
        graphics.generateTexture('construct', 40, 40);
        graphics.destroy();
        
        this.sprite = this.scene.physics.add.sprite(this.x, this.y, 'construct');
        this.sprite.setScale(1.5);
        
        // Add willpower indicator
        this.willpowerIndicator = this.scene.add.graphics();
        this.updateWillpowerVisual();
    }
    
    createEffects() {
        // Create simple graphics effects for abilities
        this.effects = {
            'amber-strike': null,
            'struggle-control': null,
            'consume-amber': null,
            'break-free': null
        };
    }
    
    setupParticleEffects() {
        // Effects will be created on-demand using graphics
    }
    
    createAbilityEffect(type, x, y) {
        const effect = this.scene.add.graphics();
        
        switch (type) {
            case 'amber-strike':
                effect.fillStyle(0xff6b35, 0.8);
                effect.fillCircle(0, 0, 15);
                break;
            case 'struggle-control':
                effect.fillStyle(0x00ff00, 0.8);
                effect.fillCircle(0, 0, 20);
                break;
            case 'consume-amber':
                effect.fillStyle(0xff6b35, 0.8);
                effect.fillCircle(0, 0, 12);
                break;
            case 'break-free':
                effect.fillStyle(0xffffff, 0.9);
                effect.fillCircle(0, 0, 25);
                break;
        }
        
        effect.x = x;
        effect.y = y;
        
        // Animate the effect
        this.scene.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
        
        return effect;
    }
    
    update(time, delta) {
        // Clear last ability used at start of frame
        this.lastAbilityUsed = null;
        
        // Update willpower drain
        this.drainWillpower(delta);
        
        // Update cooldowns
        this.updateCooldowns(delta);
        
        // Update debuffs
        this.updateDebuffs(delta);
        
        // Update target
        this.updateTarget();
        
        // Handle movement
        this.handleMovement();
        
        // Update willpower visual
        this.updateWillpowerVisual();
        
        // Update Amber Explosion cast
        this.updateAmberExplosionCast(delta);
        
        // Check for death
        if (this.willpower <= 0) {
            this.die();
        }
    }
    
    handleMovement() {
        if (this.stunned) return;
        
        // Handle keyboard input
        const cursors = this.scene.input.keyboard.createCursorKeys();
        const wasd = this.scene.input.keyboard.addKeys('W,S,A,D');
        
        let velocityX = 0;
        let velocityY = 0;
        const speed = 200;
        
        if (cursors.left.isDown || wasd.A.isDown) velocityX = -speed;
        if (cursors.right.isDown || wasd.D.isDown) velocityX = speed;
        if (cursors.up.isDown || wasd.W.isDown) velocityY = -speed;
        if (cursors.down.isDown || wasd.S.isDown) velocityY = speed;
        
        // Normalize diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }
        
        // Use the physics body's setVelocity method
        if (this.sprite.body) {
            this.sprite.body.setVelocity(velocityX, velocityY);
        }
    }
    
    drainWillpower(delta) {
        this.willpower -= (2 * delta) / 1000;
        if (this.willpower < 0) {
            this.willpower = 0;
        }
    }
    
    updateCooldowns(delta) {
        Object.keys(this.cooldowns).forEach(ability => {
            if (this.cooldowns[ability] > 0) {
                this.cooldowns[ability] -= delta / 1000;
            }
        });
    }
    
    updateDebuffs(delta) {
        Object.keys(this.debuffs).forEach(debuffName => {
            const debuff = this.debuffs[debuffName];
            if (this.scene.time.now - debuff.startTime >= debuff.duration * 1000) {
                delete this.debuffs[debuffName];
            }
        });
    }
    
    updateAmberExplosionCast(delta) {
        // Handle Amber Explosion casting
        this.amberExplosionTimer += delta;
        this.amberExplosionCooldown -= delta;
        
        if (this.amberExplosionTimer >= this.amberExplosionInterval && !this.castingAmberExplosion && this.amberExplosionCooldown <= 0) {
            this.startAmberExplosionCast();
        }
        
        if (this.castingAmberExplosion) {
            this.amberExplosionCastTime += delta;
            if (this.amberExplosionCastTime >= this.amberExplosionCastDuration) {
                this.completeAmberExplosion();
            }
        }
        
        // Check if Break Free is available (at 20% health)
        this.canBreakFree = (this.health / this.maxHealth) <= 0.2;
    }
    
    updateWillpowerVisual() {
        // Update willpower bar color based on remaining willpower
        const percentage = this.willpower / this.maxWillpower;
        
        if (percentage > 0.6) {
            this.sprite.setFillStyle(0x00ff00); // Green
        } else if (percentage > 0.3) {
            this.sprite.setFillStyle(0xffff00); // Yellow
        } else {
            this.sprite.setFillStyle(0xff0000); // Red
        }
    }
    
    updateTarget() {
        // Only target the boss, not the WoW class enemies (friendlies)
        if (this.scene.boss && this.scene.boss.sprite) {
            this.target = this.scene.boss;
        } else {
            this.target = null;
        }
    }
    
    useAmberStrike() {
        if (this.cooldowns['amber-strike'] > 0 || this.willpower < this.abilityCosts['amber-strike']) {
            this.lastAbilityUsed = null; // Clear if ability couldn't be used
            return false;
        }
        
        this.willpower -= this.abilityCosts['amber-strike'];
        this.cooldowns['amber-strike'] = this.cooldownTimes['amber-strike'];
        
        // Play effect
        this.effects['amber-strike'] = this.createAbilityEffect('amber-strike', this.sprite.x, this.sprite.y);
        
        // Deal Nature damage to target (reduced from WoW values for game balance)
        if (this.target) {
            let damage = Phaser.Math.Between(80, 120); // Reduced from 332,500-367,500
            
            // Apply 99% damage reduction to boss when Amber Monstrosity is alive
            if (this.target.type === 'boss' && this.scene.amberMonstrosity && this.scene.amberMonstrosity.health > 0) {
                damage = Math.floor(damage * 0.01); // 99% damage reduction
            }
            
            this.target.takeDamage(damage);
            this.target.addDebuff('amber-strike', 10, 60); // 10% damage increase, 1 minute
            this.target.interruptSpellcasting(); // Interrupt spellcasting
            this.damageDealt += damage;
            
            // Add stacks based on target type
            if (this.target.type === 'boss') {
                this.scene.addAmberShaperStack();
            } else if (this.target.type === 'amber-monstrosity') {
                this.scene.addMonstrosityStack();
            }
        }
        
        this.lastAbilityUsed = 'amber-strike'; // Mark that amber strike was successfully used
        return true;
    }
    
    useStruggleForControl() {
        if (this.cooldowns['struggle-control'] > 0 || this.willpower < this.abilityCosts['struggle-control']) {
            return false;
        }
        
        this.willpower -= this.abilityCosts['struggle-control'];
        this.cooldowns['struggle-control'] = this.cooldownTimes['struggle-control'];
        
        // Play effect
        this.effects['struggle-control'] = this.createAbilityEffect('struggle-control', this.sprite.x, this.sprite.y);
        
        // Interrupt Amber Explosion if casting
        if (this.castingAmberExplosion) {
            this.castingAmberExplosion = false;
            this.amberExplosionCastTime = 0;
            this.amberExplosionCooldown = 6000; // 6-second cooldown after interrupt
            console.log('Amber Explosion interrupted! 6-second cooldown applied.');
        }
        
        // Force the form to cease action for 0.5 seconds and increase damage taken by 100% for 5 seconds
        this.addDebuff('struggle-control', 100, 5); // 100% damage increase, 5 seconds
        
        // Stun effect (cease action for 0.5 seconds)
        this.stunned = true;
        this.scene.time.delayedCall(500, () => {
            this.stunned = false;
        });
        
        return true;
    }
    
    useConsumeAmber() {
        if (this.cooldowns['consume-amber'] > 0) {
            return false;
        }
        
        this.cooldowns['consume-amber'] = this.cooldownTimes['consume-amber'];
        
        // Find nearest globule
        let nearestGlobule = null;
        let nearestDistance = 100;
        
        this.scene.amberGlobules.forEach(globule => {
            const distance = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                globule.sprite.x, globule.sprite.y
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestGlobule = globule;
            }
        });
        
        if (nearestGlobule) {
            // Restore willpower (20 in normal, 50 in heroic phase 3)
            const willpowerRestore = this.scene.phase >= 3 ? 50 : 20;
            this.willpower = Math.min(this.maxWillpower, this.willpower + willpowerRestore);
            
            // Increase health by 6,300,000 (bolster the mutated form)
            this.health = Math.min(this.maxHealth, this.health + 6300000);
            this.maxHealth += 6300000;
            
            // Play effect
            this.effects['consume-amber'] = this.createAbilityEffect('consume-amber', this.sprite.x, this.sprite.y);
            
            // Consume the globule - remove it from the scene
            nearestGlobule.consume();
            
            return true;
        }
        
        return false;
    }
    
    useSmash() {
        if (this.cooldowns['smash'] > 0) {
            return false;
        }
        
        this.cooldowns['smash'] = this.cooldownTimes['smash'];
        
        // Play effect
        this.effects['smash'] = this.createAbilityEffect('smash', this.sprite.x, this.sprite.y);
        
        // Deal Physical damage to target
        if (this.target) {
            const damage = Phaser.Math.Between(102000, 138000);
            this.target.takeDamage(damage);
            this.damageDealt += damage;
        }
        
        return true;
    }
    
    useBreakFree() {
        if (!this.canBreakFree || this.cooldowns['break-free'] > 0) {
            return false;
        }
        
        this.cooldowns['break-free'] = this.cooldownTimes['break-free'];
        
        // Play effect
        this.effects['break-free'] = this.createAbilityEffect('break-free', this.sprite.x, this.sprite.y);
        
        // Regain natural form - trigger success screen
        console.log('Player broke free from the Mutated Construct!');
        
        // Trigger success screen
        if (this.scene) {
            this.scene.endGameSuccess('You jumped out before you exploded, good job!');
        }
        
        return true;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
        
        // Visual feedback
        this.sprite.setFillStyle(0xff0000);
        this.scene.time.delayedCall(200, () => {
            this.sprite.setFillStyle(0x0066ff); // Reset to blue
        });
    }
    
    canUseAbility(ability) {
        if (this.cooldowns[ability] <= 0 && this.willpower >= this.abilityCosts[ability]) {
            // Special check for Break Free
            if (ability === 'break-free') {
                return this.canBreakFree;
            }
            return true;
        }
        return false;
    }
    
    getCooldownPercent(ability) {
        return this.cooldowns[ability] / this.cooldownTimes[ability];
    }
    
    destroy() {
        this.sprite.destroy();
        this.willpowerIndicator.destroy();
        Object.values(this.effects).forEach(effect => effect.destroy());
    }
    
    addDebuff(name, value, duration) {
        this.debuffs[name] = {
            value: value,
            duration: duration,
            startTime: this.scene.time.now
        };
    }
    
    getDamageMultiplier() {
        let multiplier = 1;
        Object.values(this.debuffs).forEach(debuff => {
            if (this.scene.time.now - debuff.startTime < debuff.duration * 1000) {
                multiplier += debuff.value / 100;
            }
        });
        return multiplier;
    }
    
    startAmberExplosionCast() {
        this.castingAmberExplosion = true;
        this.amberExplosionCastTime = 0;
        console.log('WARNING: Starting Amber Explosion cast! Use Struggle for Control to interrupt!');
        
        // Visual indicator that we're casting
        this.sprite.setFillStyle(0xff0000);
    }
    
    completeAmberExplosion() {
        this.castingAmberExplosion = false;
        this.amberExplosionCastTime = 0;
        this.amberExplosionTimer = 0;
        
        // Deal 250,000 Nature damage to all players (in this case, just the player)
        this.takeDamage(250000);
        console.log('Amber Explosion completed! Player took 250,000 damage!');
        
        // Reset visual indicator
        this.sprite.setFillStyle(0x0066ff); // Reset to blue
        
        // Trigger game over - player blew up
        if (this.scene) {
            this.scene.endGame('You blew up! The raid leader called wipe. The raid leader is strongly disappointed in you.');
        }
    }
} 