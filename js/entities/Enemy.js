class Enemy {
    constructor(scene, x, y, type = 'monstrosity', wowClass = null, isRangedAttacker = false) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.type = type;
        this.wowClass = wowClass; // For WoW class enemies
        this.isRangedAttacker = isRangedAttacker; // For ranged WoW class enemies
        
        // Debug logging for Amber Monstrosity
        if (type === 'amber-monstrosity') {
            console.log('Amber Monstrosity created with type:', type);
        }
        
        // Initialize properties
        this.maxHealth = this.getMaxHealth();
        this.health = this.type === 'boss' ? (this.maxHealth * 0.85) : this.maxHealth; // Boss starts at 75% health
        this.willpower = this.getMaxWillpower();
        this.maxWillpower = this.getMaxWillpower();
        this.moveSpeed = this.getMoveSpeed();
        this.attackDamage = this.getAttackDamage();
        this.attackRange = this.getAttackRange();
        this.attackSpeed = this.getAttackSpeed();
        
        // State
        this.isAttacking = false;
        this.isBerserk = false;
        this.attackCooldown = 0;
        this.berserkTimer = 0;
        this.behaviorTimer = 0;
        
        // Healer classification
        this.isHealer = false;
        
        // Debuffs
        this.debuffs = {};
        
        // Amber Explosion casting mechanics (for Amber Monstrosity)
        this.castingAmberExplosion = false;
        this.amberExplosionCastTime = 0;
        this.amberExplosionCastDuration = 2500; // 2.5 seconds
        this.amberExplosionInterval = 50000; // Cast every 50 seconds
        this.amberExplosionTimer = 0; // Start at 0, count up to interval
        this.amberExplosionCooldown = 0; // Cooldown after interrupt
        
        // Create sprite and effects
        this.createSprite();
        this.createEffects();
        
        // Set target to boss for WoW class enemies
        if (this.type === 'wow-class' && this.scene.boss) {
            this.target = this.scene.boss;
        }
    }
    
    getMaxHealth() {
        switch (this.type) {
            case 'boss':
                return 30000; // Increased to 15,000 HP
            case 'amber-monstrosity':
                return 20000; // 10,000 HP for Amber Monstrosity
            case 'wow-class':
                return 50; // Lower health for WoW class enemies
            case 'construct':
                return 200;
            default:
                return 100;
        }
    }
    
    getMaxWillpower() {
        switch (this.type) {
            case 'construct':
                return 100;
            default:
                return 0;
        }
    }
    
    getMoveSpeed() {
        switch (this.type) {
            case 'boss':
                return 50;
            case 'wow-class':
                return 80; // Faster movement for WoW class enemies
            case 'construct':
                return 60;
            default:
                return 70;
        }
    }
    
    getAttackDamage() {
        switch (this.type) {
            case 'boss':
                return 50;
            case 'wow-class':
                if (this.wowClass && this.wowClass.damage !== undefined) {
                    return this.wowClass.damage; // Use class-specific damage (including healer modifications)
                }
                return 15; // Fallback damage
            case 'construct':
                return 30;
            default:
                return 25;
        }
    }
    
    getAttackRange() {
        switch (this.type) {
            case 'boss':
                return 40;
            case 'wow-class':
                if (this.wowClass && this.wowClass.range) {
                    return this.wowClass.range; // Use class-specific range
                }
                return 25; // Fallback range
            case 'construct':
                return 35;
            default:
                return 30;
        }
    }
    
    getAttackSpeed() {
        switch (this.type) {
            case 'boss':
                return 2000;
            case 'wow-class':
                if (this.wowClass && this.wowClass.speed) {
                    return this.wowClass.speed * 1000; // Convert seconds to milliseconds
                }
                return 1500; // Fallback attack speed
            case 'construct':
                return 2500;
            default:
                return 2000;
        }
    }
    
    createSprite() {
        // Create sprite based on type
        if (this.type === 'boss') {
            // Boss uses amberShaperUnSok image
            this.sprite = this.scene.physics.add.sprite(this.x, this.y, 'amberShaperUnSok');
            this.sprite.setScale(0.4); // Scale down the image to appropriate size
        } else if (this.type === 'amber-monstrosity') {
            // Amber Monstrosity uses amberMonstrosity image
            this.sprite = this.scene.physics.add.sprite(this.x, this.y, 'amberMonstrosity');
            this.sprite.setScale(0.6); // Scale down the image to appropriate size
        } else if (this.type === 'wow-class' && this.wowClass) {
            // WoW class enemies are colored circles
            this.sprite = this.scene.add.circle(this.x, this.y, 12, this.wowClass.color);
            
            // Add visual indicator for healers
            if (this.isHealer) {
                this.sprite.setStrokeStyle(3, 0x00ff00); // Green border for healers
            } else {
                this.sprite.setStrokeStyle(2, 0x333333); // Normal border
            }
        } else {
            // Regular enemies are red circles
            this.sprite = this.scene.add.circle(this.x, this.y, 15, 0xff0000);
            this.sprite.setStrokeStyle(2, 0xcc0000);
        }
        
        // Add physics body
        this.scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);
        
        // Add health bar
        this.healthBar = this.scene.add.graphics();
        this.healthBar.setDepth(5);
        
        // Add willpower bar for constructs
        if (this.type === 'construct') {
            this.willpowerBar = this.scene.add.graphics();
            this.willpowerBar.setDepth(5);
        }
    }
    
    createEffects() {
        // Create simple attack effect using graphics
        this.attackEffect = null;
    }
    
    createAttackEffect(x, y) {
        const effect = this.scene.add.graphics();
        effect.fillStyle(0xff0000, 0.8);
        effect.fillCircle(0, 0, 10);
        
        effect.x = x;
        effect.y = y;
        
        // Animate the effect
        this.scene.tweens.add({
            targets: effect,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
        
        return effect;
    }
    
    update(delta) {
        // Update cooldowns
        this.updateCooldowns(delta);
        
        // Update willpower for constructs
        if (this.type === 'construct') {
            this.updateWillpower(delta);
        }
        
        // Update debuffs
        this.updateDebuffs(delta);
        
        // Update Amber Explosion cast for Amber Monstrosity
        if (this.type === 'amber-monstrosity') {
            // Debug logging
            if (Math.random() < 0.001) { // Very rare logging to avoid spam
                console.log('Amber Monstrosity update called, type:', this.type);
            }
            this.updateAmberExplosionCast(delta);
        }
        
        // Update AI behavior
        this.updateAI(delta);
        
        // Update visual effects
        this.updateHealthVisual();
        if (this.type === 'construct') {
            this.updateWillpowerVisual();
        }
        
        // Check for berserk state
        if (this.type === 'construct' && this.willpower <= 0 && !this.isBerserk) {
            this.goBerserk();
        }
    }
    
    updateCooldowns(delta) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }
    }
    
    updateWillpower(delta) {
        this.willpower -= this.willpowerDrainRate * (delta / 1000);
        if (this.willpower < 0) {
            this.willpower = 0;
        }
    }
    
    updateDebuffs(delta) {
        Object.keys(this.debuffs).forEach(debuffName => {
            const debuff = this.debuffs[debuffName];
            debuff.duration -= delta / 1000;
            
            if (debuff.duration <= 0) {
                delete this.debuffs[debuffName];
            }
        });
    }
    
    updateAmberExplosionCast(delta) {
        // Handle Amber Explosion casting for Amber Monstrosity
        this.amberExplosionTimer += delta;
        this.amberExplosionCooldown -= delta;
        
        // Debug logging
        if (this.type === 'amber-monstrosity' && Math.random() < 0.01) { // Log 1% of the time to avoid spam
            console.log(`Amber Monstrosity timer update: ${this.amberExplosionTimer}ms / ${this.amberExplosionInterval}ms`);
        }
        
        if (this.amberExplosionTimer >= this.amberExplosionInterval && !this.castingAmberExplosion && this.amberExplosionCooldown <= 0) {
            this.startAmberExplosionCast();
        }
        
        if (this.castingAmberExplosion) {
            this.amberExplosionCastTime += delta;
            if (this.amberExplosionCastTime >= this.amberExplosionCastDuration) {
                this.completeAmberExplosion();
            }
        }
    }
    
    updateAI(delta) {
        if (this.type === 'wow-class') {
            this.updateWoWClassAI(delta);
        } else {
            this.updateStandardAI(delta);
        }
    }
    
    updateWoWClassAI(delta) {
        // WoW class enemies target Amber Monstrosity if it's alive, otherwise target the boss
        let shouldChangeTarget = false;
        
        // Check if we need to change target
        if (!this.target) {
            shouldChangeTarget = true;
        } else if (this.scene.amberMonstrosity && this.scene.amberMonstrosity.health > 0) {
            // Amber Monstrosity is alive, should target it
            if (this.target !== this.scene.amberMonstrosity) {
                shouldChangeTarget = true;
            }
        } else {
            // Amber Monstrosity is dead or doesn't exist, should target boss
            if (this.target !== this.scene.boss) {
                shouldChangeTarget = true;
            }
        }
        
        // Change target if needed
        if (shouldChangeTarget) {
            const oldTarget = this.target;
            if (this.scene.amberMonstrosity && this.scene.amberMonstrosity.health > 0) {
                this.target = this.scene.amberMonstrosity;
                if (oldTarget !== this.target) {
                    console.log(`${this.wowClass?.name || 'WoW Class'} now targeting Amber Monstrosity`);
                }
            } else {
                this.target = this.scene.boss;
                if (oldTarget !== this.target) {
                    console.log(`${this.wowClass?.name || 'WoW Class'} now targeting Boss`);
                }
            }
        }
        
        if (this.target) {
            const distanceToTarget = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                this.target.sprite.x, this.target.sprite.y
            );
            
            const attackRange = this.getAttackRange();
            const isRanged = attackRange >= 24; // Updated threshold for scaled ranges
            
            if (isRanged) {
                // Ranged attackers maintain their attack range distance
                if (distanceToTarget <= attackRange) {
                    // In range, attack
                    this.attackTarget();
                } else if (distanceToTarget > attackRange + 2) {
                    // Too far, move closer
                    this.moveTowardsTarget(this.target, this.moveSpeed);
                } else if (distanceToTarget < attackRange - 1) {
                    // Too close, move away
                    this.moveAwayFromTarget(this.target, this.moveSpeed);
                }
                // If in perfect range, don't move, just attack
            } else {
                // Melee attackers move towards target and attack when in range
                this.moveTowardsTarget(this.target, this.moveSpeed);
                
                if (distanceToTarget <= attackRange) {
                    this.attackTarget();
                }
            }
            
            // Deal indirect damage to player if close to boss (only when targeting boss)
            if (this.scene.player && this.target === this.scene.boss) {
                const distanceToPlayer = Phaser.Math.Distance.Between(
                    this.sprite.x, this.sprite.y,
                    this.scene.player.sprite.x, this.scene.player.sprite.y
                );
                
                // If player is within 50 pixels of the boss, take indirect damage
                const distanceToBossFromPlayer = Phaser.Math.Distance.Between(
                    this.scene.player.sprite.x, this.scene.player.sprite.y,
                    this.target.sprite.x, this.target.sprite.y
                );
                
                if (distanceToBossFromPlayer <= 50 && distanceToPlayer <= 30) {
                    this.dealIndirectDamage();
                }
            }
        }
    }
    
    updateStandardAI(delta) {
        // Standard AI for other enemy types
        this.behaviorTimer += delta / 1000;
        
        if (!this.target) {
            this.findTarget();
        }
        
        if (this.target) {
            // Move towards target
            this.moveTowardsTarget(this.target, this.moveSpeed);
            
            // Attack if in range
            const distance = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                this.target.sprite.x, this.target.sprite.y
            );
            
            if (distance <= this.attackRange) {
                this.attack();
            }
        } else {
            // Wander if no target
            this.wander();
        }
    }
    
    findTarget() {
        if (this.type === 'boss') {
            // Boss targets player
            this.target = this.scene.player;
        } else if (this.isBerserk) {
            // Berserk constructs attack everything
            this.target = this.scene.player;
        } else {
            // Regular enemies target player
            this.target = this.scene.player;
        }
    }
    
    moveTowardsTarget(target, speed) {
        if (!target || !target.sprite) return;
        
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y,
            target.sprite.x, target.sprite.y
        );
        
        const velocityX = Math.cos(angle) * speed;
        const velocityY = Math.sin(angle) * speed;
        
        this.sprite.body.setVelocity(velocityX, velocityY);
    }
    
    moveAwayFromTarget(target, speed) {
        if (!target || !target.sprite) return;
        
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y,
            target.sprite.x, target.sprite.y
        );
        
        // Move in opposite direction (add PI to reverse the angle)
        const velocityX = Math.cos(angle + Math.PI) * speed;
        const velocityY = Math.sin(angle + Math.PI) * speed;
        
        this.sprite.body.setVelocity(velocityX, velocityY);
    }
    
    wander() {
        if (this.behaviorTimer > 2) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const velocityX = Math.cos(angle) * this.moveSpeed * 0.5;
            const velocityY = Math.sin(angle) * this.moveSpeed * 0.5;
            
            if (this.sprite.body) {
                this.sprite.body.setVelocity(velocityX, velocityY);
            }
            this.behaviorTimer = 0;
        }
    }
    
    attack() {
        this.isAttacking = true;
        this.attackCooldown = this.attackSpeed;
        
        // Play attack effect
        this.attackEffect = this.createAttackEffect(this.sprite.x, this.sprite.y);
        
        // Deal damage
        if (this.target) {
            this.target.takeDamage(this.attackDamage);
        }
        
        // Visual feedback
        this.sprite.setFillStyle(0xff0000);
        this.scene.time.delayedCall(200, () => {
            // Reset to original color based on type
            if (this.type === 'boss') {
                this.sprite.setFillStyle(0x8B0000); // Dark red for boss
            } else {
                this.sprite.setFillStyle(0xff0000); // Red for regular enemies
            }
        });
    }
    
    attackTarget() {
        if (this.attackCooldown <= 0) {
            this.attackCooldown = this.attackSpeed;
            
            // Debug logging for attack speeds (only occasionally to reduce spam)
            if (this.wowClass && Math.random() < 0.1) { // Only log 10% of attacks
                const targetName = this.target === this.scene.boss ? 'Boss' : 
                                  this.target === this.scene.amberMonstrosity ? 'Amber Monstrosity' : 'Unknown';
                console.log(`${this.wowClass.name} attacking ${targetName} for ${this.attackDamage} damage`);
            }
            
            // Deal damage to target
            if (this.target) {
                this.target.takeDamage(this.attackDamage);
            }
            
            // Visual feedback - only for circle sprites (WoW class enemies)
            if (this.type === 'wow-class' && this.wowClass) {
                this.sprite.setFillStyle(0xff0000);
                this.scene.time.delayedCall(200, () => {
                    this.sprite.setFillStyle(this.wowClass.color);
                });
            }
        }
    }
    
    dealIndirectDamage() {
        // Deal small indirect damage to player
        if (this.scene.player) {
            this.scene.player.takeDamage(5); // Small indirect damage
        }
    }
    
    takeDamage(amount) {
        // Apply damage reduction from debuffs
        let finalDamage = amount;
        Object.values(this.debuffs).forEach(debuff => {
            if (debuff.type === 'amber-strike') {
                finalDamage *= (1 + debuff.value / 100);
            }
        });
        
        // Apply stack-based damage amplification (10% per stack)
        let stackMultiplier = 1;
        let stackCount = 0;
        if (this.type === 'boss' && this.scene.amberShaperStacks > 0) {
            stackMultiplier = 1 + (this.scene.amberShaperStacks * 0.1); // 10% per stack
            stackCount = this.scene.amberShaperStacks;
            finalDamage *= stackMultiplier;
            console.log(`Boss taking ${amount} damage with ${this.scene.amberShaperStacks} stacks: ${amount} * ${stackMultiplier.toFixed(2)} = ${Math.round(finalDamage)}`);
        } else if (this.type === 'amber-monstrosity' && this.scene.monstrosityStacks > 0) {
            stackMultiplier = 1 + (this.scene.monstrosityStacks * 0.1); // 10% per stack
            stackCount = this.scene.monstrosityStacks;
            finalDamage *= stackMultiplier;
            console.log(`Amber Monstrosity taking ${amount} damage with ${this.scene.monstrosityStacks} stacks: ${amount} * ${stackMultiplier.toFixed(2)} = ${Math.round(finalDamage)}`);
        }
        
        // Apply 99% damage reduction to boss if Amber Monstrosity is alive
        if (this.type === 'boss' && this.scene.amberMonstrosity && this.scene.amberMonstrosity.health > 0) {
            let reduced = finalDamage * 0.01;
            finalDamage = Math.max(1, Math.round(reduced));
        } else {
            finalDamage = Math.round(finalDamage);
        }
        this.health -= finalDamage;
        
        // Show damage number with color based on stack amplification
        if (this.scene.uiManager) {
            let damageColor = '#ff0000'; // Default red
            if (stackCount > 0) {
                if (stackCount >= 10) {
                    damageColor = '#ff00ff'; // Magenta for 10+ stacks
                } else if (stackCount >= 5) {
                    damageColor = '#ff8800'; // Orange for 5+ stacks
                } else {
                    damageColor = '#ffff00'; // Yellow for 1-4 stacks
                }
            }
            this.scene.uiManager.showDamageNumber(this.sprite.x, this.sprite.y - 30, finalDamage, damageColor);
        }
        
        // Visual feedback - only for circle sprites (WoW class enemies)
        if (this.type === 'wow-class' && this.wowClass) {
            this.sprite.setFillStyle(0xff0000);
            this.scene.time.delayedCall(200, () => {
                this.sprite.setFillStyle(this.wowClass.color);
            });
        }
        if (this.health <= 0) {
            this.die();
        }
    }
    
    addDebuff(name, value, duration) {
        this.debuffs[name] = {
            value: value,
            duration: duration,
            type: name
        };
    }
    
    consumeGlobule(globule) {
        if (this.type === 'construct' && this.willpower < this.maxWillpower) {
            this.willpower = Math.min(this.maxWillpower, this.willpower + 20);
            this.scene.removeGlobule(globule);
            globule.destroy();
        }
    }
    
    goBerserk() {
        this.isBerserk = true;
        this.berserkTimer = 30; // 30 seconds berserk duration
        
        // Visual change - only for circle sprites (WoW class enemies)
        if (this.type === 'wow-class' && this.wowClass) {
            this.sprite.setFillStyle(0xff0000);
        }
        
        // Increase stats
        this.moveSpeed *= 1.5;
        this.attackDamage *= 1.5;
        this.attackSpeed *= 0.7;
    }
    
    setPhase(phase) {
        this.phase = phase;
        
        if (this.type === 'boss') {
            // Boss gets new abilities in different phases
            switch (phase) {
                case 2:
                    this.attackDamage *= 1.3;
                    this.moveSpeed *= 1.2;
                    break;
                case 3:
                    this.attackDamage *= 1.5;
                    this.moveSpeed *= 1.4;
                    this.attackSpeed *= 0.8;
                    break;
            }
        }
    }
    
    updateHealthVisual() {
        // For sprite images, we don't need to set fill styles
        // The visual feedback is handled by the health bar below
        
        // Update health bar
        this.healthBar.clear();
        
        const barWidth = this.type === 'amber-monstrosity' ? 60 : 30; // Larger bar for monstrosity
        const barHeight = this.type === 'amber-monstrosity' ? 8 : 4; // Taller bar for monstrosity
        const healthPercent = this.health / this.maxHealth;
        
        // Get sprite dimensions for proper positioning
        let spriteRadius = 15; // Default for circles
        if (this.type === 'boss') {
            spriteRadius = 30; // Approximate radius for boss image
        } else if (this.type === 'amber-monstrosity') {
            spriteRadius = 60; // Approximate radius for monstrosity image
        }
        
        // Background
        this.healthBar.fillStyle(0x333333);
        this.healthBar.fillRect(
            this.sprite.x - barWidth / 2,
            this.sprite.y - spriteRadius - 10,
            barWidth,
            barHeight
        );
        
        // Health bar
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(
            this.sprite.x - barWidth / 2,
            this.sprite.y - spriteRadius - 10,
            barWidth * healthPercent,
            barHeight
        );
    }
    
    updateWillpowerVisual() {
        if (!this.willpowerBar) return;
        
        this.willpowerBar.clear();
        
        const barWidth = 30;
        const barHeight = 3;
        const x = this.sprite.x - barWidth / 2;
        // Position willpower bar above health bar
        const y = this.sprite.y - 25; // Adjusted for new sprite positioning
        
        // Background
        this.willpowerBar.fillStyle(0x333333);
        this.willpowerBar.fillRect(x, y, barWidth, barHeight);
        
        // Fill
        const fillWidth = (this.willpower / this.maxWillpower) * barWidth;
        const fillColor = this.willpower > 20 ? 0xffff00 : 0xff0000;
        this.willpowerBar.fillStyle(fillColor);
        this.willpowerBar.fillRect(x, y, fillWidth, barHeight);
        
        // Border
        this.willpowerBar.lineStyle(1, 0xffffff);
        this.willpowerBar.strokeRect(x, y, barWidth, barHeight);
    }
    
    die() {
        // Remove from scene
        this.scene.removeEnemy(this);
        
        // Destroy sprite and effects
        this.sprite.destroy();
        // The gradient circle logic is removed as per the new createSprite method
        this.healthBar.destroy();
        if (this.willpowerBar) {
            this.willpowerBar.destroy();
        }
        if (this.attackEffect) {
            this.attackEffect.destroy();
        }
    }
    
    destroy() {
        this.die();
    }
    
    updateAttackDamage() {
        // Update attack damage based on current wowClass damage value
        if (this.type === 'wow-class' && this.wowClass) {
            this.attackDamage = this.wowClass.damage;
        }
    }
    
    startAmberExplosionCast() {
        this.castingAmberExplosion = true;
        this.amberExplosionCastTime = 0;
        this.amberExplosionTimer = 0; // Reset the timer when starting cast
        console.log('WARNING: Amber Monstrosity starting Amber Explosion cast! Target it and press 1 to interrupt!');
    }
    
    completeAmberExplosion() {
        this.castingAmberExplosion = false;
        this.amberExplosionCastTime = 0;
        this.amberExplosionTimer = 0; // Reset timer to start counting down to next cast
        
        // Deal massive damage to all players (in this case, just the player)
        if (this.scene.player) {
            this.scene.player.takeDamage(500000); // 500,000 damage
            console.log('Amber Monstrosity Amber Explosion completed! Player took 500,000 damage!');
        }
        
        // Trigger game over - player blew up
        if (this.scene) {
            this.scene.endGame('You blew up! The Amber Monstrosity\'s Amber Explosion killed you. The raid leader called wipe.');
        }
    }
    
    interruptSpellcasting() {
        // Interrupt any ongoing spellcasting
        this.casting = false;
        this.castTime = 0;
        
        // Interrupt Amber Explosion if casting
        if (this.castingAmberExplosion) {
            this.castingAmberExplosion = false;
            this.amberExplosionCastTime = 0;
            this.amberExplosionCooldown = 6000; // 6-second cooldown after interrupt
            this.amberExplosionTimer = 0; // Reset timer to start counting down to next cast
            console.log('Amber Monstrosity Amber Explosion interrupted! 6-second cooldown applied.');
        }
        
        console.log('Enemy spellcasting interrupted');
    }
    
    isCasting() {
        return this.casting;
    }
    
    getDamageMultiplier() {
        let multiplier = 1;
        
        // Apply stack-based damage amplification only
        if (this.type === 'boss' && this.scene.amberShaperStacks > 0) {
            multiplier *= (1 + (this.scene.amberShaperStacks * 0.1)); // 10% per stack
        } else if (this.type === 'amber-monstrosity' && this.scene.monstrosityStacks > 0) {
            multiplier *= (1 + (this.scene.monstrosityStacks * 0.1)); // 10% per stack
        }
        
        return multiplier;
    }
    
    getStackOnlyMultiplier() {
        // Get only the stack-based multiplier for display purposes
        if (this.type === 'boss' && this.scene.amberShaperStacks > 0) {
            return 1 + (this.scene.amberShaperStacks * 0.1); // 10% per stack
        } else if (this.type === 'amber-monstrosity' && this.scene.monstrosityStacks > 0) {
            return 1 + (this.scene.monstrosityStacks * 0.1); // 10% per stack
        }
        return 1;
    }
    
    getStackCount() {
        if (this.type === 'boss') {
            return this.scene.amberShaperStacks || 0;
        } else if (this.type === 'amber-monstrosity') {
            return this.scene.monstrosityStacks || 0;
        }
        return 0;
    }
} 