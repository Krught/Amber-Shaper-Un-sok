# Amber-Shaper Un'sok Construct Simulator

A browser-based game that simulates the Mutated Construct mechanics from the Amber-Shaper Un'sok boss fight in World of Warcraft: Mists of Pandaria. Built with Phaser 3 and modern web technologies.

## 🎮 Game Overview

You play as a Mutated Construct, a transformed player character with unique abilities and a critical willpower management system. Your goal is to help defeat Amber-Shaper Un'sok while managing your willpower to avoid going berserk.

## 🚀 How to Run

1. **Simple Setup**: Just open `index.html` in a modern web browser
2. **Local Server** (recommended): 
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. Navigate to `http://localhost:8000` in your browser

## 🎯 How to Play

### Controls
- **Movement**: Arrow keys or WASD
- **Abilities**: 
  - `1` or click button: Amber Strike
  - `2` or click button: Consume Amber
  - `3` or click button: Amber Scalpel
  - `4` or click button: Smash

### Core Mechanics

#### 🧠 Willpower System
- Your willpower drains over time (2 points/second)
- If willpower reaches 0, you go berserk and the raid wipes
- Use **Consume Amber** to restore willpower from nearby globules
- Manage your abilities carefully - they cost willpower!

#### ⚡ Abilities

1. **Amber Strike (1)**
   - Cost: 5 Willpower
   - Cooldown: 3 seconds
   - Effect: Interrupts enemies and applies damage debuff
   - Priority: Use on enemy constructs to prevent them from going berserk

2. **Consume Amber (2)**
   - Cost: 0 Willpower
   - Cooldown: 5 seconds
   - Effect: Restore 30 willpower from nearby amber globules
   - Strategy: Use when willpower is low (below 30)

3. **Amber Scalpel (3)**
   - Cost: 10 Willpower
   - Cooldown: 8 seconds
   - Effect: Creates amber globules near your target
   - Strategy: Use to create fuel for Consume Amber

4. **Smash (4)**
   - Cost: 15 Willpower
   - Cooldown: 2 seconds
   - Effect: Deal heavy damage to enemies
   - Warning: Burns willpower quickly - use sparingly!

### 🎭 Game Phases

#### Phase 1 (0-30 seconds)
- Basic mechanics introduction
- One player transformed at a time
- Focus on learning willpower management
- Use Amber Strike to stack debuff on boss

#### Phase 2 (30-60 seconds)
- Enemy Mutated Constructs spawn
- Interrupt enemy constructs to prevent berserk
- Boss becomes more aggressive
- Multiple constructs may be active

#### Phase 3 (60+ seconds)
- Maximum chaos and difficulty
- Multiple enemy constructs
- Boss gains construct abilities
- Critical willpower management required

### 🎯 Objectives

1. **Primary Goal**: Defeat Amber-Shaper Un'sok
2. **Critical Rule**: Never let your willpower reach 0
3. **Secondary Goals**:
   - Prevent enemy constructs from going berserk
   - Manage amber globules strategically
   - Deal maximum damage while maintaining control

### ⚠️ Failure Conditions

- **Willpower reaches 0**: You go berserk and wipe the raid
- **Too many berserk enemies**: 3+ enemy constructs berserk = raid wipe
- **Boss defeats you**: If you die, the raid fails

## 🏆 Scoring System

Your score is calculated based on:
- Time survived (10 points per second)
- Damage dealt (5 points per damage point)
- Bonus points for efficient willpower management

## 🎨 Features

- **Real-time willpower management**
- **Dynamic phase progression**
- **Particle effects and visual feedback**
- **Responsive design for different screen sizes**
- **Keyboard and mouse controls**
- **Tooltips and UI feedback**
- **Animated transitions and effects**

## 🛠️ Technical Details

- **Engine**: Phaser 3.60.0
- **Language**: JavaScript (ES6+)
- **Graphics**: Canvas-based with particle systems
- **Physics**: Arcade physics for collision detection
- **UI**: Modern CSS with animations and responsive design

## 🎵 Game Design Philosophy

This simulator recreates the unique mechanics of the Amber-Shaper Un'sok fight, specifically the Mutated Construct transformation. The game emphasizes:

- **Resource Management**: Willpower as a critical resource
- **Risk vs Reward**: Powerful abilities with high costs
- **Multi-tasking**: Managing multiple objectives simultaneously
- **Progressive Difficulty**: Three distinct phases with increasing complexity

## 🔧 Customization

The game is designed to be easily modifiable:

- **Ability costs and cooldowns** can be adjusted in `Player.js`
- **Enemy spawn rates** can be modified in `GameScene.js`
- **Visual effects** can be customized in the respective entity classes
- **Phase timings** can be changed in the phase management system

## 📝 Credits

- **Original Boss Design**: Blizzard Entertainment (World of Warcraft: Mists of Pandaria)
- **Game Engine**: Phaser (https://phaser.io/)
- **Inspiration**: Teron Gorefiend Construct Simulator by jconnop

## 🐛 Known Issues

- Particle effects may be intensive on older devices
- Some visual effects may not work in all browsers
- Mobile support is limited (desktop recommended)

## 🚀 Future Enhancements

- Sound effects and background music
- Additional enemy types
- More complex boss mechanics
- Multiplayer support
- Leaderboards and achievements
- Mobile optimization

---

**Enjoy mastering the Mutated Construct mechanics! Remember: Willpower management is key to victory!** 🎮✨ 