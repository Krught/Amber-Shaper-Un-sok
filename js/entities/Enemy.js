class Enemy {
    constructor(scene, x, y, type = 'monstrosity', wowClass = null, isRangedAttacker = false) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.type = type;
        this.wowClass = wowClass; // For WoW class enemies
        this.isRangedAttacker = isRangedAttacker; // For ranged WoW class enemies
        
        // Initialize properties
        this.maxHealth = this.getMaxHealth();
        this.health = this.type === 'boss' ? 11250 : this.maxHealth; // Boss starts at 75% health
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
        
        // Debuffs
        this.debuffs = {};
        
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
                return 15000; // Increased to 15,000 HP
            case 'amber-monstrosity':
                return 10000; // 10,000 HP for Amber Monstrosity
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
                if (this.wowClass && this.wowClass.damage) {
                    return this.wowClass.damage; // Use class-specific damage
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
            // Boss is a dark red circle
            this.sprite = this.scene.add.circle(this.x, this.y, 30, 0x8B0000);
            this.sprite.setStrokeStyle(3, 0x660000);
        } else if (this.type === 'amber-monstrosity') {
            // Amber Monstrosity is a large orange/yellow gradient circle (2x boss size)
            this.sprite = this.scene.add.circle(this.x, this.y, 60, 0xFF6600);
            this.sprite.setStrokeStyle(6, 0xFFAA00);
            
            // Add gradient effect using a second circle
            const gradientCircle = this.scene.add.circle(this.x, this.y, 50, 0xFFAA00);
            gradientCircle.setAlpha(0.7);
            this.gradientCircle = gradientCircle;
        } else if (this.type === 'wow-class' && this.wowClass) {
            // WoW class enemies are colored circles
            this.sprite = this.scene.add.circle(this.x, this.y, 12, this.wowClass.color);
            this.sprite.setStrokeStyle(2, 0x333333);
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
    
    updateAI(delta) {
        if (this.type === 'wow-class') {
            this.updateWoWClassAI(delta);
        } else {
            this.updateStandardAI(delta);
        }
    }
    
    updateWoWClassAI(delta) {
        // WoW class enemies always target the boss
        if (!this.target || this.target.type !== 'boss') {
            this.target = this.scene.boss;
        }
        
        if (this.target) {
            const distanceToBoss = Phaser.Math.Distance.Between(
                this.sprite.x, this.sprite.y,
                this.target.sprite.x, this.target.sprite.y
            );
            
            const attackRange = this.getAttackRange();
            const isRanged = attackRange >= 24; // Updated threshold for scaled ranges
            
            if (isRanged) {
                // Ranged attackers maintain their attack range distance
                if (distanceToBoss <= attackRange) {
                    // In range, attack
                    this.attackBoss();
                } else if (distanceToBoss > attackRange + 2) {
                    // Too far, move closer
                    this.moveTowardsTarget(this.target, this.moveSpeed);
                } else if (distanceToBoss < attackRange - 1) {
                    // Too close, move away
                    this.moveAwayFromTarget(this.target, this.moveSpeed);
                }
                // If in perfect range, don't move, just attack
            } else {
                // Melee attackers move towards boss and attack when in range
                this.moveTowardsTarget(this.target, this.moveSpeed);
                
                if (distanceToBoss <= attackRange) {
                    this.attackBoss();
                }
            }
            
            // Deal indirect damage to player if close to boss
            if (this.scene.player) {
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
    
    attackBoss() {
        if (this.attackCooldown <= 0) {
            this.attackCooldown = this.attackSpeed;
            
            // Debug logging for attack speeds
            if (this.wowClass) {
                console.log(`${this.wowClass.name} attacking boss with ${this.attackSpeed}ms cooldown (${this.attackSpeed/1000}s)`);
            }
            
            // Deal damage to boss
            if (this.target) {
                this.target.takeDamage(this.attackDamage);
            }
            
            // Visual feedback
            this.sprite.setFillStyle(0xff0000);
            this.scene.time.delayedCall(200, () => {
                if (this.wowClass) {
                    this.sprite.setFillStyle(this.wowClass.color);
                } else {
                    this.sprite.setFillStyle(0xff0000);
                }
            });
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
        
        this.health -= finalDamage;
        
        // Visual feedback
        this.sprite.setFillStyle(0xff0000);
        this.scene.time.delayedCall(200, () => {
            this.updateHealthVisual();
        });
        
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
        
        // Visual change
        this.sprite.setFillStyle(0xff0000);
        
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
        // Reset to original color based on type
        if (this.type === 'boss') {
            this.sprite.setFillStyle(0x8B0000); // Dark red for boss
        } else if (this.type === 'amber-monstrosity') {
            this.sprite.setFillStyle(0xFF6600); // Orange for Amber Monstrosity
            if (this.gradientCircle) {
                this.gradientCircle.setFillStyle(0xFFAA00); // Yellow gradient
            }
        } else if (this.type === 'wow-class' && this.wowClass) {
            this.sprite.setFillStyle(this.wowClass.color); // WoW class color
        } else {
            this.sprite.setFillStyle(0xff0000); // Red for regular enemies
        }
        
        // Update health bar
        this.healthBar.clear();
        
        const barWidth = this.type === 'amber-monstrosity' ? 60 : 30; // Larger bar for monstrosity
        const barHeight = this.type === 'amber-monstrosity' ? 8 : 4; // Taller bar for monstrosity
        const healthPercent = this.health / this.maxHealth;
        
        // Background
        this.healthBar.fillStyle(0x333333);
        this.healthBar.fillRect(
            this.sprite.x - barWidth / 2,
            this.sprite.y - this.sprite.radius - 10,
            barWidth,
            barHeight
        );
        
        // Health bar
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(
            this.sprite.x - barWidth / 2,
            this.sprite.y - this.sprite.radius - 10,
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
        const y = this.sprite.y - 20;
        
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
        if (this.gradientCircle) {
            this.gradientCircle.destroy();
        }
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
    
    interruptSpellcasting() {
        // Interrupt any ongoing spellcasting
        this.casting = false;
        this.castTime = 0;
        console.log('Enemy spellcasting interrupted');
    }
    
    isCasting() {
        return this.casting;
    }
} 