class UIManager {
    constructor() {
        this.abilityButtons = {};
        this.cooldownOverlays = {};
        
        this.initializeAbilityButtons();
        this.setupEventListeners();
        this.addCSSAnimations();
    }
    
    initializeAbilityButtons() {
        // Get all ability buttons
        const buttons = document.querySelectorAll('.ability-btn');
        
        buttons.forEach(btn => {
            const ability = btn.dataset.ability;
            this.abilityButtons[ability] = btn;
            
            // Create cooldown overlay
            const overlay = document.createElement('div');
            overlay.className = 'cooldown-overlay';
            overlay.style.display = 'none';
            btn.appendChild(overlay);
            this.cooldownOverlays[ability] = overlay;
        });
    }
    
    setupEventListeners() {
        // Add hover effects for ability buttons
        Object.values(this.abilityButtons).forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.showAbilityTooltip(btn);
            });
            
            btn.addEventListener('mouseleave', () => {
                this.hideAbilityTooltip();
            });
        });
    }
    
    updateAbilityCooldowns(player) {
        Object.keys(this.abilityButtons).forEach(ability => {
            const button = this.abilityButtons[ability];
            const overlay = this.cooldownOverlays[ability];
            
            // Get or create cooldown fill element
            let cooldownFill = button.querySelector('.cooldown-fill');
            if (!cooldownFill) {
                cooldownFill = document.createElement('div');
                cooldownFill.className = 'cooldown-fill';
                button.appendChild(cooldownFill);
            }
            
            if (player.cooldowns[ability] > 0) {
                // Show cooldown
                button.classList.add('cooldown');
                overlay.style.display = 'block';
                
                // Update cooldown text
                const cooldownText = Math.ceil(player.cooldowns[ability]);
                if (!overlay.querySelector('.cooldown-text')) {
                    const text = document.createElement('div');
                    text.className = 'cooldown-text';
                    text.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        color: white;
                        font-weight: bold;
                        font-size: 12px;
                        z-index: 10;
                    `;
                    overlay.appendChild(text);
                }
                overlay.querySelector('.cooldown-text').textContent = cooldownText;
                
                // Update cooldown fill
                const cooldownTime = this.getCooldownTime(ability);
                const remainingPercent = (player.cooldowns[ability] / cooldownTime) * 100;
                cooldownFill.style.height = `${remainingPercent}%`;
                
            } else {
                // Hide cooldown
                button.classList.remove('cooldown');
                overlay.style.display = 'none';
                cooldownFill.style.height = '0%';
            }
            
            // Check if ability can be used
            if (player.canUseAbility(ability)) {
                button.style.borderColor = '#4caf50';
                button.style.opacity = '1';
                button.classList.remove('cooldown');
            } else {
                button.style.borderColor = '#95a5a6';
                button.style.opacity = '0.7';
                if (player.cooldowns[ability] > 0) {
                    button.classList.add('cooldown');
                }
            }
        });
    }
    
    getCooldownTime(ability) {
        const cooldownTimes = {
            'amber-strike': 3,
            'struggle-control': 1,
            'consume-amber': 5,
            'break-free': 0
        };
        return cooldownTimes[ability] || 1;
    }
    
    showAbilityTooltip(button) {
        const ability = button.dataset.ability;
        const tooltip = this.createTooltip(ability);
        
        // Position tooltip
        const rect = button.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - 80) + 'px';
        
        document.body.appendChild(tooltip);
        
        // Store reference for removal
        button.tooltip = tooltip;
    }
    
    hideAbilityTooltip() {
        // Remove any existing tooltips
        document.querySelectorAll('.ability-tooltip').forEach(tooltip => {
            tooltip.remove();
        });
    }
    
    createTooltip(ability) {
        const tooltip = document.createElement('div');
        tooltip.className = 'ability-tooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ffd700;
            font-size: 12px;
            max-width: 200px;
            z-index: 1000;
            pointer-events: none;
        `;
        
        const tooltipData = this.getTooltipData(ability);
        tooltip.innerHTML = `
            <div style="font-weight: bold; color: #ffd700; margin-bottom: 5px;">
                ${tooltipData.name}
            </div>
            <div style="margin-bottom: 5px;">
                ${tooltipData.description}
            </div>
            <div style="color: #cccccc; font-size: 11px;">
                Cost: ${tooltipData.cost} Willpower<br>
                Cooldown: ${tooltipData.cooldown}s
            </div>
        `;
        
        return tooltip;
    }
    
    getTooltipData(ability) {
        const data = {
            'amber-strike': {
                name: 'Amber Strike',
                description: 'Inflicts 332,500-367,500 Nature damage and interrupts spellcasting. Destabilizes target, increasing damage taken by 10% for 1 min (stacks).',
                cost: 5,
                cooldown: 3
            },
            'struggle-control': {
                name: 'Struggle for Control',
                description: 'Expend 8 Willpower to force the form to cease action for 0.5 sec and increase damage taken by 100% for 5 sec. CRITICAL: Use this to interrupt your own Amber Explosion cast!',
                cost: 8,
                cooldown: 1
            },
            'consume-amber': {
                name: 'Consume Amber',
                description: 'Consume Burning Amber pools to restore 20 Willpower (50 in Phase 3) and increase health by 6,300,000.',
                cost: 0,
                cooldown: 5
            },
            'break-free': {
                name: 'Break Free',
                description: 'Available at 20% health - regain your natural form and restore full health/willpower.',
                cost: 0,
                cooldown: 0
            }
        };
        
        return data[ability] || { name: 'Unknown', description: 'Unknown ability', cost: 0, cooldown: 0 };
    }
    
    showPhaseTransition(phase) {
        const phaseText = document.createElement('div');
        phaseText.className = 'phase-transition';
        phaseText.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: #ffd700;
            padding: 20px 40px;
            border-radius: 10px;
            border: 2px solid #ffd700;
            font-size: 24px;
            font-weight: bold;
            z-index: 1000;
            animation: phaseTransition 2s ease-in-out;
        `;
        
        phaseText.textContent = `Phase ${phase}`;
        document.body.appendChild(phaseText);
        
        // Remove after animation
        setTimeout(() => {
            phaseText.remove();
        }, 2000);
    }
    
    showDamageNumber(x, y, amount, color = '#ff0000') {
        const damageText = document.createElement('div');
        damageText.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            color: ${color};
            font-weight: bold;
            font-size: 16px;
            pointer-events: none;
            z-index: 1000;
            animation: damageFloat 1s ease-out;
        `;
        
        damageText.textContent = amount;
        document.body.appendChild(damageText);
        
        // Remove after animation
        setTimeout(() => {
            damageText.remove();
        }, 1000);
    }
    
    showWillpowerWarning() {
        const warning = document.createElement('div');
        warning.className = 'willpower-warning';
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 1000;
            animation: warningPulse 0.5s ease-in-out infinite;
        `;
        
        warning.textContent = 'WARNING: Willpower Critical!';
        document.body.appendChild(warning);
        
        // Remove after 3 seconds
        setTimeout(() => {
            warning.remove();
        }, 3000);
    }
    
    showBerserkWarning() {
        const warning = document.createElement('div');
        warning.className = 'berserk-warning';
        warning.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            z-index: 1000;
            animation: berserkWarning 2s ease-in-out;
        `;
        
        warning.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">⚠️ BERSERK WARNING ⚠️</div>
            <div>Willpower reaching zero!</div>
        `;
        document.body.appendChild(warning);
        
        // Remove after animation
        setTimeout(() => {
            warning.remove();
        }, 2000);
    }
    
    updateScore(score) {
        const scoreElement = document.getElementById('score-value');
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }
    
    updateTimer(time) {
        const timerElement = document.querySelector('.timer-text');
        if (timerElement) {
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    addCSSAnimations() {
        // Add CSS animations if not already present
        if (!document.getElementById('game-animations')) {
            const style = document.createElement('style');
            style.id = 'game-animations';
            style.textContent = `
                @keyframes phaseTransition {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
                }
                
                @keyframes damageFloat {
                    0% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-50px); }
                }
                
                @keyframes warningPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                @keyframes berserkWarning {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    update(player) {
        if (player) {
            this.updateAbilityCooldowns(player);
            this.updateAbilityButtons(player);
        }
    }
    
    updateCastBar(isCasting, castProgress = 0) {
        const castBar = document.getElementById('cast-bar');
        const castBarFill = document.querySelector('.cast-bar-fill');
        
        if (isCasting) {
            castBar.style.display = 'block';
            castBarFill.style.width = `${castProgress}%`;
        } else {
            castBar.style.display = 'none';
            castBarFill.style.width = '0%';
        }
    }
    
    updateAbilityButtons(player) {
        if (!player) return;
        
        // Update Break Free button
        const breakFreeBtn = document.querySelector('[data-ability="break-free"]');
        if (breakFreeBtn) {
            if (player.canBreakFree) {
                breakFreeBtn.classList.add('available');
                breakFreeBtn.classList.remove('disabled');
            } else {
                breakFreeBtn.classList.remove('available');
                breakFreeBtn.classList.add('disabled');
            }
        }
    }
    
    updateWillpower(current, max) {
        const willpowerBar = document.querySelector('.willpower-fill');
        const willpowerText = document.querySelector('.willpower-text');
        
        if (willpowerBar) {
            const percentage = Math.max(0, Math.min(100, (current / max) * 100));
            willpowerBar.style.width = `${percentage}%`;
            
            // Change color based on willpower level
            if (percentage > 60) {
                willpowerBar.style.backgroundColor = '#4CAF50';
            } else if (percentage > 30) {
                willpowerBar.style.backgroundColor = '#FF9800';
            } else {
                willpowerBar.style.backgroundColor = '#F44336';
            }
        }
        
        if (willpowerText) {
            willpowerText.textContent = `${Math.floor(current)}/${Math.floor(max)}`;
        }
    }
} 