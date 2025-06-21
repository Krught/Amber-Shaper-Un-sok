class AmberGlobule {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // Properties
        this.willpowerValue = 30;
        this.lifespan = 30; // seconds
        this.age = 0;
        
        // Visual properties
        this.pulseTimer = 0;
        this.pulseSpeed = 2;
        this.baseScale = 1;
        
        // Create sprite as a small yellow circle
        this.sprite = this.scene.add.circle(x, y, 8, 0xffd700);
        this.sprite.setStrokeStyle(1, 0xffb300);
        
        // Add physics body (but no movement)
        this.scene.physics.add.existing(this.sprite);
        this.sprite.body.setImmovable(true);
        
        // No movement - globules stay in place
        this.sprite.body.setVelocity(0, 0);
        
        // Create effects
        this.createEffects();
    }
    
    createSprite() {
        // Create amber globule sprite
        const graphics = this.scene.add.graphics();
        
        // Main body
        graphics.fillStyle(0xffd700);
        graphics.fillCircle(0, 0, 12);
        
        // Inner glow
        graphics.fillStyle(0xffff00);
        graphics.fillCircle(0, 0, 8);
        
        // Outer ring
        graphics.lineStyle(2, 0xff6b35);
        graphics.strokeCircle(0, 0, 12);
        
        // Generate texture
        graphics.generateTexture('amber-globule', 24, 24);
        graphics.destroy();
        
        this.sprite = this.scene.physics.add.sprite(this.x, this.y, 'amber-globule');
        this.sprite.setScale(this.baseScale);
        
        // Add floating animation
        this.scene.tweens.add({
            targets: this.sprite,
            y: this.sprite.y - 10,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createEffects() {
        // Create simple glow effect using graphics
        this.glowEffect = null;
        this.consumptionEffect = null;
    }
    
    createGlowEffect() {
        const glow = this.scene.add.graphics();
        glow.fillStyle(0xffd700, 0.3);
        glow.fillCircle(0, 0, 20);
        
        glow.x = this.sprite.x;
        glow.y = this.sprite.y;
        
        // Pulse animation
        this.scene.tweens.add({
            targets: glow,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.6,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        return glow;
    }
    
    createConsumptionEffect() {
        const effect = this.scene.add.graphics();
        effect.fillStyle(0x00ff00, 0.8);
        effect.fillCircle(0, 0, 15);
        
        effect.x = this.sprite.x;
        effect.y = this.sprite.y;
        
        // Expand and fade animation
        this.scene.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                effect.destroy();
            }
        });
        
        return effect;
    }
    
    update(delta) {
        // Remove lifespan system - globules never expire unless consumed
        // this.age += delta / 1000;
        
        // Check if expired - REMOVED: globules never expire
        // if (this.age >= this.lifespan) {
        //     this.expire();
        //     return;
        // }
        
        // Update pulse effect
        this.pulseTimer += delta / 1000;
        const pulse = Math.sin(this.pulseTimer * this.pulseSpeed) * 0.1 + 1;
        this.sprite.setScale(pulse);
        
        // Update rotation
        this.sprite.rotation += 0.02;
        
        // Update particle effects
        this.updateEffects();
        
        // Update visual based on age - REMOVED: no age-based visual changes
        // this.updateVisual();
    }
    
    updateEffects() {
        // Update glow effect position if it exists
        if (this.glowEffect) {
            this.glowEffect.x = this.sprite.x;
            this.glowEffect.y = this.sprite.y;
        }
    }
    
    updateVisual() {
        // Change color based on remaining lifespan
        const remainingLife = 1 - (this.age / this.lifespan);
        
        if (remainingLife < 0.3) {
            // Fading - make it more transparent
            this.sprite.setAlpha(remainingLife / 0.3);
        } else {
            this.sprite.setAlpha(1);
        }
        
        // Change color to indicate age
        this.sprite.setFillStyle(0xff6b35); // Orange when getting old
    }
    
    consume() {
        // Play consumption effect
        this.consumptionEffect = this.createConsumptionEffect();
        
        // Remove from scene
        this.scene.removeGlobule(this);
        
        // Destroy after effect
        this.scene.time.delayedCall(1000, () => {
            this.destroy();
        });
    }
    
    expire() {
        // Create expiration effect
        const expireEffect = this.scene.add.graphics();
        expireEffect.fillStyle(0x666666, 0.8);
        expireEffect.fillCircle(0, 0, 10);
        
        expireEffect.x = this.sprite.x;
        expireEffect.y = this.sprite.y;
        
        // Expand and fade animation
        this.scene.tweens.add({
            targets: expireEffect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                expireEffect.destroy();
            }
        });
        
        // Remove from scene
        this.scene.removeGlobule(this);
        
        // Destroy after effect
        this.scene.time.delayedCall(1500, () => {
            this.destroy();
        });
    }
    
    getWillpowerValue() {
        return this.willpowerValue;
    }
    
    isNearby(x, y, range = 100) {
        const distance = Phaser.Math.Distance.Between(x, y, this.sprite.x, this.sprite.y);
        return distance <= range;
    }
    
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
        if (this.glowEffect) {
            this.glowEffect.destroy();
        }
        if (this.consumptionEffect) {
            this.consumptionEffect.destroy();
        }
    }
} 