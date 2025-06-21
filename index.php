<?php

$version = 1;

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Amber-Shaper Un'sok Construct Simulator</title>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="game-container">
        <div id="game-ui">
            <div id="title-screen" class="screen">
                <h1>Amber-Shaper Un'sok</h1>
                <h2>Construct Simulator</h2>
                <p>Master the Mutated Construct mechanics!</p>
                
                <!-- Game Result Display Area -->
                <div id="game-result-area" class="game-result-area hidden">
                    <div id="result-message" class="result-message"></div>
                    <div id="final-score-display" class="final-score-display">
                        Final Score: <span id="title-score-value">0</span>
                    </div>
                </div>
                
                <button id="start-game">Start Training</button>
                <button id="instructions-btn">Instructions</button>

                <a id="github-btn" href="https://github.com/Krught/Amber-Shaper-Un-sok" target="_blank" rel="noopener noreferrer">Github</a>
            </div>
            
            <div id="instructions-screen" class="screen hidden">
                <h2>How to Play</h2>
                <div class="instructions-content">
                    <h3>🎯 Your Mission</h3>
                    <p>You are a Mutated Construct! Control your Willpower and help defeat Amber-Shaper Un'sok.</p>
                    
                    <h3>⚡ Abilities</h3>
                    <ul>
                        <li><strong>Amber Strike (1):</strong> Inflicts 332,500-367,500 Nature damage and interrupts spellcasting. Destabilizes target, increasing damage taken by 10% for 1 min (stacks). <strong>CRITICAL:</strong> Use this to interrupt the Amber Monstrosity's Amber Explosion cast!</li>
                        <li><strong>Struggle for Control (2):</strong> Expend 8 Willpower to force the form to cease action for 0.5 sec and increase damage taken by 100% for 5 sec. <strong>CRITICAL:</strong> Use this to interrupt your own Amber Explosion cast!</li>
                        <li><strong>Consume Amber (3):</strong> Consume Burning Amber pools to restore 20 Willpower (50 in Phase 3) and increase health by 6,300,000.</li>
                        <li><strong>Break Free (4):</strong> Always available - regain your natural form and end the game.</li>
                    </ul>
                    
                    <h3>⚠️ Critical Rules</h3>
                    <ul>
                        <li>Willpower drains at 2 per second - keep it above 0 or you'll die!</li>
                        <li><strong>WARNING:</strong> You periodically cast "Amber Explosion" over 2.5 seconds - this will kill you if not interrupted!</li>
                        <li>Use Struggle for Control (2) to interrupt your own Amber Explosion cast</li>
                        <li><strong>NEW:</strong> When the Amber Monstrosity is alive, it also casts "Amber Explosion" over 2.5 seconds every 50 seconds</li>
                        <li><strong>CRITICAL:</strong> To interrupt the Amber Monstrosity's cast, target it and press 1 (Amber Strike)</li>
                        <li>Cast bars show "Self: Amber Explosion (2)" for your cast and "Boss: Amber Explosion (1)" for the monstrosity's cast</li>
                        <li>Amber Strike interrupts enemy spellcasting</li>
                        <li>Consume Amber strategically to restore Willpower</li>
                        <li>Break Free can be used at any time to end the game</li>
                    </ul>
                    
                    <h3>🏆 Scoring System</h3>
                    <p><strong>Your score is calculated using a sophisticated system that rewards both skill and speed!</strong></p>
                    
                    <h4>Base Score Components:</h4>
                    <ul>
                        <li><strong>Time survived:</strong> 10 points per second</li>
                        <li><strong>Damage dealt:</strong> 5 points per damage point</li>
                    </ul>
                    
                    <h4>Stack-Based Points (Primary Scoring):</h4>
                    <p>The main way to earn points is through managing stacks on the boss and Amber Monstrosity:</p>
                    <ul>
                        <li><strong>0→1 stacks:</strong> 100 points</li>
                        <li><strong>1→2 stacks:</strong> 200 points</li>
                        <li><strong>2→3 stacks:</strong> 400 points</li>
                        <li><strong>3→4 stacks:</strong> 800 points</li>
                        <li><strong>And so on</strong> (doubling each time)</li>
                    </ul>
                    
                    <h4>Stack Penalties:</h4>
                    <ul>
                        <li><strong>Losing stacks:</strong> -50% of the points you would have gained for that stack</li>
                        <li><strong>Stack timeout:</strong> Stacks reset after 15 seconds of inactivity</li>
                    </ul>
                    
                    <h4>Time-Based Multiplier (Boss Kill Bonus):</h4>
                    <p>When you defeat the boss, your total score is multiplied based on kill time. The multiplier decreases continuously, rewarding every second saved:</p>
                    <ul>
                        <li><strong>≤30 seconds:</strong> 4.0x - 5.5x multiplier (bonus for very fast kills)</li>
                        <li><strong>30-60 seconds:</strong> 4.0x → 3.0x multiplier (smooth transition)</li>
                        <li><strong>60-90 seconds:</strong> 3.0x → 2.0x multiplier (smooth transition)</li>
                        <li><strong>90-120 seconds:</strong> 2.0x → 1.5x multiplier (smooth transition)</li>
                        <li><strong>120-180 seconds:</strong> 1.5x → 1.2x multiplier (smooth transition)</li>
                        <li><strong>180-240 seconds:</strong> 1.2x → 1.0x multiplier (smooth transition)</li>
                        <li><strong>>240 seconds:</strong> 1.0x multiplier (no bonus)</li>
                    </ul>
                    
                    <h4>Examples:</h4>
                    <ul>
                        <li>60 seconds = 3.0x multiplier</li>
                        <li>62 seconds = 2.93x multiplier</li>
                        <li>65 seconds = 2.83x multiplier</li>
                        <li>90 seconds = 2.0x multiplier</li>
                    </ul>
                    
                    <h4>Final Score Formula:</h4>
                    <p><code>Final Score = (Base Score + Stack Points) × Time Multiplier</code></p>
                    
                    <h4>Scoring Strategy:</h4>
                    <ul>
                        <li><strong>Focus on maintaining high stacks</strong> - this is your primary source of points</li>
                        <li><strong>Kill the boss quickly</strong> for maximum time multiplier</li>
                        <li><strong>Avoid losing stacks</strong> - penalties are significant</li>
                        <li><strong>Balance damage dealing with stack management</strong></li>
                    </ul>
                </div>
                <button id="back-to-title">Back to Title</button>
            </div>
            
            <div id="game-screen" class="screen hidden">
                <div id="game-ui">
                    <div id="willpower-bar" class="bar">
                        <div id="willpower-fill" class="bar-fill"></div>
                    </div>
                    <span id="willpower-text">100/100</span>
                    
                    <div id="game-info">
                        <span id="phase-text">Phase 1</span>
                        <span id="timer">00:00</span>
                        <span>Score: <span id="score-value">0</span></span>
                        <span id="boss-explosion-timer" style="display: none;">Next Boss Explosion: <span id="boss-explosion-countdown">50s</span></span>
                    </div>
                </div>
                
                <div id="cast-bar" style="display: none;">
                    <div class="cast-bar-bg">
                        <div class="cast-bar-fill"></div>
                        <div class="cast-bar-text">Amber Explosion</div>
                    </div>
                </div>
                
                <!-- Removed game-over-screen and success-screen overlays -->
            </div>
            
            <div id="ability-bar">
                <button class="ability-btn" data-ability="amber-strike">1<br>Amber Strike</button>
                <button class="ability-btn" data-ability="struggle-control">2<br>Struggle for Control</button>
                <button class="ability-btn" data-ability="consume-amber">3<br>Consume Amber</button>
                <button class="ability-btn" data-ability="break-free">4<br>Break Free</button>
            </div>
        </div>
        
        <div id="phaser-game"></div>
    </div>
    
    <script src="js/game.js?v=<?php echo $version; ?>"></script>
    <script src="js/scenes/TitleScene.js?v=<?php echo $version; ?>"></script>
    <script src="js/scenes/GameScene.js?v=<?php echo $version; ?>"></script>
    <script src="js/entities/Player.js?v=<?php echo $version; ?>"></script>
    <script src="js/entities/Enemy.js?v=<?php echo $version; ?>"></script>
    <script src="js/entities/AmberGlobule.js?v=<?php echo $version; ?>"></script>
    <script src="js/ui/UIManager.js?v=<?php echo $version; ?>"></script>
    <script src="js/main.js?v=<?php echo $version; ?>"></script>
</body>
</html> 