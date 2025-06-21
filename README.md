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
  - `2` or click button: Struggle For Control
  - `3` or click button: Consume Amber
  - `4` or click button: Break Free

### Core Mechanics

#### 🧠 Willpower System
- Your willpower drains over time (2 points/second)
- If willpower reaches 0, you go berserk and the raid wipes
- Use **Consume Amber** to restore willpower from nearby globules
- Manage your abilities carefully - they cost willpower!

#### ⚡ Abilities

1. **Amber Strike (1)**
   - Cost: 0 Willpower
   - Cooldown: 6 seconds
   - Effect: Interrupts enemies and applies damage debuff
   - Priority: Use on enemy constructs to prevent them from going berserk

2. **Struggle For Control (2)**
   - Cost: 8 Willpower
   - Cooldown: 6 seconds
   - Effect: CRITICAL: Use this to interrupt your own Amber Explosion cast!
   - Strategy: Don't let yourself finish the Amber Explosion cast

3. **Consume Amber (3)**
   - Cost: 0 Willpower
   - Cooldown: 5 seconds
   - Effect: Consume Amber 
   - Strategy: Use to create fuel for Consume Amber

4. **Smash (4)**
   - Cost: 0 Willpower
   - Cooldown: 0 seconds
   - Effect: Available at 20% health - regain your natural form.
   - Strategy: Use this to "win the game", but only if you are unable to kill Amber Shaper Un'sok

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
- **Amber Explosion casted**: If you cast Amber Explosion, the raid fails
- **Boss defeats you**: If you die, the raid fails

## 🏆 Scoring System

Your score is calculated using a sophisticated system that rewards both speed and skill:

### Base Score Components
- **Time survived**: 10 points per second
- **Damage dealt**: 5 points per damage point

### Stack-Based Points (Primary Scoring)
The main way to earn points is through managing stacks on the boss and Amber Monstrosity:

#### Stack Point Calculation
- **0→1 stacks**: 100 points
- **1→2 stacks**: 200 points  
- **2→3 stacks**: 400 points
- **3→4 stacks**: 800 points
- **And so on** (doubling each time)

#### Stack Penalties
- **Losing stacks**: -50% of the points you would have gained for that stack
- **Stack timeout**: Stacks reset after 15 seconds of inactivity

### Time-Based Multiplier (Boss Kill Bonus)
When you defeat the boss, your total score is multiplied based on kill time. The multiplier decreases continuously, rewarding every second saved:

- **≤30 seconds**: 4.0x - 5.5x multiplier (bonus for very fast kills)
- **30-60 seconds**: 4.0x → 3.0x multiplier (smooth transition)
- **60-90 seconds**: 3.0x → 2.0x multiplier (smooth transition)
- **90-120 seconds**: 2.0x → 1.5x multiplier (smooth transition)
- **120-180 seconds**: 1.5x → 1.2x multiplier (smooth transition)
- **180-240 seconds**: 1.2x → 1.0x multiplier (smooth transition)
- **>240 seconds**: 1.0x multiplier (no bonus)

**Examples:**
- 60 seconds = 3.0x multiplier
- 62 seconds = 2.93x multiplier
- 65 seconds = 2.83x multiplier
- 90 seconds = 2.0x multiplier

### Final Score Formula
```
Final Score = (Base Score + Stack Points) × Time Multiplier
```

### Scoring Strategy
- **Focus on maintaining high stacks** - this is your primary source of points
- **Kill the boss quickly** for maximum time multiplier
- **Avoid losing stacks** - penalties are significant
- **Balance damage dealing with stack management**

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