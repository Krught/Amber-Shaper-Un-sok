class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }
    
    create() {
        // Create animated background
        this.createBackground();
        
        // Add title text with effects
        this.createTitleText();
        
        // Add floating amber particles
        this.createParticles();
    }
    
    createBackground() {
        // Create gradient background
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
        graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        
        // Add some ambient lighting effects
        const light = this.add.graphics();
        light.fillStyle(0xffffff, 0.1);
        light.fillCircle(this.cameras.main.width / 2, this.cameras.main.height / 2, 200);
        
        // Animate the light
        this.tweens.add({
            targets: light,
            alpha: 0.3,
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
    }
    
    createTitleText() {
        // Main title
        const title = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 3, 
            'AMBER-SHAPER UN\'SOK', {
            fontSize: '48px',
            fill: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Add glow effect
        title.setShadow(2, 2, '#000000', 2);
        
        // Subtitle
        const subtitle = this.add.text(this.cameras.main.width / 2, title.y + 80, 
            'CONSTRUCT SIMULATOR', {
            fontSize: '24px',
            fill: '#ff6b35',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Animate title
        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
        
        // Add description
        const description = this.add.text(this.cameras.main.width / 2, subtitle.y + 60, 
            'Master the Mutated Construct mechanics!', {
            fontSize: '18px',
            fill: '#cccccc'
        }).setOrigin(0.5);
        
        // Fade in effect
        title.setAlpha(0);
        subtitle.setAlpha(0);
        description.setAlpha(0);
        
        this.tweens.add({
            targets: [title, subtitle, description],
            alpha: 1,
            duration: 1000,
            stagger: 200
        });
    }
    
    createParticles() {
        // Create simple floating elements using graphics instead of particles
        for (let i = 0; i < 10; i++) {
            const particle = this.add.graphics();
            particle.fillStyle(0xffd700, 0.6);
            particle.fillCircle(0, 0, 3);
            
            // Random position
            particle.x = Phaser.Math.Between(0, this.cameras.main.width);
            particle.y = Phaser.Math.Between(0, this.cameras.main.height);
            
            // Floating animation
            this.tweens.add({
                targets: particle,
                y: particle.y - 50,
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                ease: 'Sine.easeInOut',
                repeat: -1,
                yoyo: false,
                onComplete: () => {
                    particle.destroy();
                }
            });
            
            // Create new particle after this one finishes
            this.time.delayedCall(Phaser.Math.Between(2000, 4000), () => {
                this.createFloatingParticle();
            });
        }
    }
    
    createFloatingParticle() {
        const particle = this.add.graphics();
        particle.fillStyle(0xffd700, 0.6);
        particle.fillCircle(0, 0, 3);
        
        particle.x = Phaser.Math.Between(0, this.cameras.main.width);
        particle.y = this.cameras.main.height + 10;
        
        this.tweens.add({
            targets: particle,
            y: particle.y - 100,
            alpha: 0,
            duration: Phaser.Math.Between(3000, 6000),
            ease: 'Sine.easeInOut',
            onComplete: () => {
                particle.destroy();
                this.createFloatingParticle();
            }
        });
    }
    
    update() {
        // Add any continuous updates here
    }
} 