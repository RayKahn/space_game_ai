// Space Shooter Game
// A complete p5.js implementation with custom-built sprites and assets

let player;
let bullets = [];
let enemies = [];
let stars = [];
let explosions = [];
let powerUps = [];
let gameState = "start";
let score = 0;
let lives = 3;
let level = 1;
let enemySpawnRate = 120; // frames between enemy spawns
let frameCounter = 0;
let playerColor;
let enemyColors = [];
let backgroundStars = 150;
let gameFont;
let shieldActive = false;
let shieldTime = 0;
let shieldDuration = 300; // 5 seconds at 60fps

// Game sound effects (implemented with oscillators)
let shootSound;
let explosionSound;
let powerUpSound;

function setup() {
  createCanvas(800, 600);
  frameRate(60);
  noCursor();
  
  // Initialize player with custom color
  playerColor = color(0, 255, 220);
  player = new Player();
  
  // Initialize enemy colors
  enemyColors = [
    color(255, 100, 100), // Red enemy
    color(255, 200, 100), // Orange enemy
    color(255, 255, 100), // Yellow enemy
    color(100, 255, 100), // Green enemy
    color(100, 100, 255)  // Blue enemy
  ];
  
  // Initialize starfield
  for (let i = 0; i < backgroundStars; i++) {
    stars.push(new Star());
  }

  // Create sound effects
  shootSound = new p5.Oscillator('sine');
  explosionSound = new p5.Oscillator('sawtooth');
  powerUpSound = new p5.Oscillator('triangle');
  
  // Don't start them playing yet
  shootSound.amp(0);
  explosionSound.amp(0);
  powerUpSound.amp(0);
  
  shootSound.start();
  explosionSound.start();
  powerUpSound.start();
}

function draw() {
  background(0);
  
  // Update and render stars
  updateStars();
  
  if (gameState === "start") {
    displayStartScreen();
  } else if (gameState === "play") {
    updateGame();
    displayHUD();
  } else if (gameState === "gameOver") {
    displayGameOverScreen();
  } else if (gameState === "levelUp") {
    displayLevelUpScreen();
  }
  
  // Draw custom cursor
  drawCursor();
}

function updateStars() {
  for (let i = 0; i < stars.length; i++) {
    stars[i].update();
    stars[i].display();
  }
}

function updateGame() {
  frameCounter++;
  
  // Update shield timer
  if (shieldActive) {
    shieldTime--;
    if (shieldTime <= 0) {
      shieldActive = false;
    }
  }
  
  // Spawn enemies based on level difficulty
  if (frameCounter >= enemySpawnRate) {
    spawnEnemy();
    frameCounter = 0;
  }
  
  // Randomly spawn power-ups (1% chance per frame)
  if (random() < 0.01) {
    powerUps.push(new PowerUp(random(width), 0, floor(random(3))));
  }
  
  // Update player
  player.update();
  player.display();
  
  // Update and display bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].display();
    
    // Remove bullets that go off screen
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
    }
  }
  
  // Update and display enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    enemies[i].display();
    
    // Check collision with player
    if (enemies[i].hits(player) && !shieldActive) {
      // Create explosion
      explosions.push(new Explosion(enemies[i].x, enemies[i].y, enemies[i].size));
      playExplosionSound();
      
      // Remove enemy
      enemies.splice(i, 1);
      
      // Reduce lives
      lives--;
      
      // Check for game over
      if (lives <= 0) {
        gameState = "gameOver";
      }
      
      continue;
    }
    
    // Check if enemy has moved off screen
    if (enemies[i].y > height + enemies[i].size) {
      enemies.splice(i, 1);
    } else {
      // Check bullet collision
      for (let j = bullets.length - 1; j >= 0; j--) {
        if (enemies[i] && bullets[j].hits(enemies[i])) {
          // Add to score
          score += 10 * level;
          
          // Create explosion
          explosions.push(new Explosion(enemies[i].x, enemies[i].y, enemies[i].size));
          playExplosionSound();
          
          // Remove bullet and enemy
          bullets.splice(j, 1);
          enemies.splice(i, 1);
          
          break;
        }
      }
    }
  }
  
  // Update and display power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    powerUps[i].update();
    powerUps[i].display();
    
    // Check collision with player
    if (powerUps[i].hits(player)) {
      activatePowerUp(powerUps[i].type);
      powerUps.splice(i, 1);
      continue;
    }
    
    // Remove power-ups that go off screen
    if (powerUps[i].y > height) {
      powerUps.splice(i, 1);
    }
  }
  
  // Update and display explosions
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].update();
    explosions[i].display();
    
    // Remove completed explosions
    if (explosions[i].isFinished()) {
      explosions.splice(i, 1);
    }
  }
  
  // Check for level up (every 500 points)
  if (score >= level * 500) {
    levelUp();
  }
}

function displayHUD() {
  // Display score
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text("Score: " + score, 20, 30);
  
  // Display lives
  text("Lives: ", 20, 60);
  for (let i = 0; i < lives; i++) {
    fill(playerColor);
    drawPlayerShip(80 + i * 25, 55, 10);
  }
  
  // Display level
  textAlign(RIGHT);
  fill(255);
  text("Level: " + level, width - 20, 30);
  
  // Display shield status if active
  if (shieldActive) {
    textAlign(CENTER);
    fill(0, 255, 220, 128);
    text("Shield: " + ceil(shieldTime / 60) + "s", width / 2, 30);
  }
}

function displayStartScreen() {
  textAlign(CENTER);
  fill(255);
  textSize(40);
  text("COSMIC DEFENDER", width / 2, height / 3);
  
  textSize(24);
  text("Move: Mouse", width / 2, height / 2);
  text("Shoot: Click or Space", width / 2, height / 2 + 40);
  
  textSize(20);
  text("Press ENTER to start", width / 2, height / 2 + 100);
  text("Press ESC to return to menu", width / 2, height / 2 + 130);
  
  // Draw player ship at the center
  fill(playerColor);
  drawPlayerShip(width / 2, height / 2 - 50, 30);
}

function displayGameOverScreen() {
  textAlign(CENTER);
  fill(255, 0, 0);
  textSize(40);
  text("GAME OVER", width / 2, height / 3);
  
  fill(255);
  textSize(24);
  text("Final Score: " + score, width / 2, height / 2);
  
  textSize(20);
  text("Press ENTER to play again", width / 2, height / 2 + 50);
}

function displayLevelUpScreen() {
  textAlign(CENTER);
  fill(0, 255, 0);
  textSize(40);
  text("LEVEL " + level, width / 2, height / 3);
  
  fill(255);
  textSize(24);
  text("Score: " + score, width / 2, height / 2);
  
  textSize(20);
  text("Press ENTER to continue", width / 2, height / 2 + 50);
}

function drawCursor() {
  push();
  stroke(255);
  noFill();
  ellipse(mouseX, mouseY, 10, 10);
  line(mouseX - 10, mouseY, mouseX + 10, mouseY);
  line(mouseX, mouseY - 10, mouseX, mouseY + 10);
  pop();
}

function spawnEnemy() {
  let type = floor(random(5)); // 5 different enemy types
  let x = random(width);
  let size = random(20, 40);
  let speed = map(level, 1, 10, 2, 5) + random(-1, 1);
  
  enemies.push(new Enemy(x, -size, size, type, speed));
}

function levelUp() {
  level++;
  gameState = "levelUp";
  
  // Increase difficulty
  enemySpawnRate = max(30, 120 - (level * 10));
}

function activatePowerUp(type) {
  playPowerUpSound();
  
  switch(type) {
    case 0: // Extra life
      lives = min(lives + 1, 5);
      break;
    case 1: // Shield
      shieldActive = true;
      shieldTime = shieldDuration;
      break;
    case 2: // Clear all enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        explosions.push(new Explosion(enemies[i].x, enemies[i].y, enemies[i].size));
        score += 5 * level;
      }
      enemies = [];
      break;
  }
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    returnToStart();
  }
  
  if (keyCode === ENTER || keyCode === RETURN) {
    if (gameState === "start") {
      gameState = "play";
    } else if (gameState === "gameOver") {
      // Reset game
      resetGame();
      gameState = "play";
    } else if (gameState === "levelUp") {
      gameState = "play";
    }
  }
  
  if (keyCode === 32 && gameState === "play") { // Space bar
    player.shoot();
  }
}

function mousePressed() {
  if (gameState === "play") {
    player.shoot();
  }
}

function resetGame() {
  player = new Player();
  bullets = [];
  enemies = [];
  explosions = [];
  powerUps = [];
  score = 0;
  lives = 3;
  level = 1;
  enemySpawnRate = 120;
  frameCounter = 0;
  shieldActive = false;
}

function playShootSound() {
  shootSound.freq(880);
  shootSound.amp(0.1, 0.05);
  shootSound.amp(0, 0.2);
}

function playExplosionSound() {
  explosionSound.freq(random(150, 300));
  explosionSound.amp(0.1, 0.05);
  explosionSound.amp(0, 0.5);
}

function playPowerUpSound() {
  powerUpSound.freq(660);
  powerUpSound.amp(0.1, 0.05);
  powerUpSound.amp(0, 0.3);
}

function returnToStart() {
  // Stop all sound effects
  shootSound.stop();
  explosionSound.stop();
  powerUpSound.stop();
  
  // Clear all game objects
  bullets = [];
  enemies = [];
  explosions = [];
  powerUps = [];
  stars = [];
  
  // Reset game state
  gameState = "start";
  
  // Reset game variables
  score = 0;
  lives = 3;
  level = 1;
  enemySpawnRate = 120;
  frameCounter = 0;
  shieldActive = false;
  
  // Create new player
  player = new Player();
  
  // Restart sound effects
  shootSound.start();
  explosionSound.start();
  powerUpSound.start();
}

// Draw a custom player ship
function drawPlayerShip(x, y, size) {
  push();
  translate(x, y);
  
  // Ship body
  beginShape();
  vertex(0, -size);
  vertex(size/2, size/2);
  vertex(0, size/4);
  vertex(-size/2, size/2);
  endShape(CLOSE);
  
  // Engines
  fill(255, 150, 0);
  rect(-size/3, size/4, size/5, size/3);
  rect(size/3 - size/5, size/4, size/5, size/3);
  
  // Engine flame
  if (gameState === "play") {
    fill(255, random(100, 255), 0);
    beginShape();
    vertex(-size/3, size/4 + size/3);
    vertex(-size/3 + size/5, size/4 + size/3);
    vertex(-size/3 + size/10, size/4 + size/3 + random(size/2, size));
    endShape(CLOSE);
    
    beginShape();
    vertex(size/3 - size/5, size/4 + size/3);
    vertex(size/3, size/4 + size/3);
    vertex(size/3 - size/10, size/4 + size/3 + random(size/2, size));
    endShape(CLOSE);
  }
  
  // Cockpit
  fill(100, 200, 255);
  ellipse(0, 0, size/3, size/3);
  
  pop();
}

// Classes

class Player {
  constructor() {
    this.x = width / 2;
    this.y = height - 100;
    this.size = 30;
    this.cooldown = 0;
    this.shootDelay = 15; // frames between shots
  }
  
  update() {
    // Follow mouse position
    this.x = mouseX;
    this.y = constrain(mouseY, height/2, height - 50);
    
    // Update cooldown
    if (this.cooldown > 0) {
      this.cooldown--;
    }
  }
  
  display() {
    fill(playerColor);
    drawPlayerShip(this.x, this.y, this.size);
    
    // Draw shield if active
    if (shieldActive) {
      push();
      noFill();
      stroke(0, 255, 220, 128 + 64 * sin(frameCount * 0.1));
      strokeWeight(3);
      ellipse(this.x, this.y, this.size * 2.5);
      pop();
    }
  }
  
  shoot() {
    if (this.cooldown <= 0) {
      bullets.push(new Bullet(this.x, this.y - this.size));
      this.cooldown = this.shootDelay;
      playShootSound();
    }
  }
}

class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.size = 5;
  }
  
  update() {
    this.y -= this.speed;
  }
  
  display() {
    // Draw bullet trail
    for (let i = 0; i < 5; i++) {
      let alpha = 255 - i * 50;
      fill(0, 255, 220, alpha);
      ellipse(this.x, this.y + i * 4, this.size * (5-i)/5);
    }
    
    // Draw bullet
    fill(255);
    ellipse(this.x, this.y, this.size);
  }
  
  hits(target) {
    let d = dist(this.x, this.y, target.x, target.y);
    return d < this.size/2 + target.size/2;
  }
}

class Enemy {
  constructor(x, y, size, type, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.type = type;
    this.speed = speed;
    this.rotation = 0;
    this.rotationSpeed = random(-0.05, 0.05);
  }
  
  update() {
    this.y += this.speed;
    this.rotation += this.rotationSpeed;
  }
  
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    fill(enemyColors[this.type]);
    
    // Different enemy shapes based on type
    switch(this.type) {
      case 0: // Triangle
        triangle(0, -this.size/2, this.size/2, this.size/2, -this.size/2, this.size/2);
        // Details
        fill(255, 100);
        ellipse(0, 0, this.size/3);
        break;
        
      case 1: // Square
        rectMode(CENTER);
        rect(0, 0, this.size, this.size);
        // Details
        fill(255, 100);
        rect(0, 0, this.size/2, this.size/2, this.size/10);
        break;
        
      case 2: // Circle with spikes
        ellipse(0, 0, this.size);
        // Spikes
        stroke(enemyColors[this.type]);
        strokeWeight(2);
        for (let i = 0; i < 8; i++) {
          let angle = TWO_PI * i / 8;
          line(cos(angle) * this.size/2, sin(angle) * this.size/2, 
               cos(angle) * this.size, sin(angle) * this.size);
        }
        noStroke();
        // Center
        fill(255, 100);
        ellipse(0, 0, this.size/2);
        break;
        
      case 3: // Diamond
        quad(0, -this.size/2, this.size/2, 0, 0, this.size/2, -this.size/2, 0);
        // Details
        fill(255, 100);
        quad(0, -this.size/4, this.size/4, 0, 0, this.size/4, -this.size/4, 0);
        break;
        
      case 4: // Star
        beginShape();
        for(let i = 0; i < 10; i++) {
          let angle = map(i, 0, 10, 0, TWO_PI);
          let radius = (i % 2 === 0) ? this.size/2 : this.size/4;
          let x = cos(angle) * radius;
          let y = sin(angle) * radius;
          vertex(x, y);
        }
        endShape(CLOSE);
        // Center
        fill(255, 100);
        ellipse(0, 0, this.size/3);
        break;
    }
    
    pop();
  }
  
  hits(target) {
    let d = dist(this.x, this.y, target.x, target.y);
    return d < (this.size/2 + target.size/2) * 0.8; // 0.8 for better collision feel
  }
}

class Explosion {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.particles = [];
    this.lifespan = 30;
    
    // Create explosion particles
    for (let i = 0; i < floor(size); i++) {
      this.particles.push({
        x: 0,
        y: 0,
        vx: random(-3, 3),
        vy: random(-3, 3),
        alpha: 255,
        size: random(2, 6)
      });
    }
  }
  
  update() {
    this.lifespan--;
    
    // Update particles
    for (let p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = map(this.lifespan, 30, 0, 255, 0);
    }
  }
  
  display() {
    push();
    translate(this.x, this.y);
    
    // Draw particles
    for (let p of this.particles) {
      fill(255, 200, 0, p.alpha);
      ellipse(p.x, p.y, p.size);
    }
    
    // Central flash
    let flashSize = map(this.lifespan, 30, 0, this.size, 0);
    fill(255, 255, 200, map(this.lifespan, 30, 0, 200, 0));
    ellipse(0, 0, flashSize);
    
    pop();
  }
  
  isFinished() {
    return this.lifespan <= 0;
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // 0: Extra life, 1: Shield, 2: Clear enemies
    this.size = 20;
    this.speed = 2;
    this.rotation = 0;
    this.colors = [
      color(255, 100, 100), // Red for extra life
      color(100, 200, 255), // Blue for shield
      color(255, 255, 100)  // Yellow for clear enemies
    ];
  }
  
  update() {
    this.y += this.speed;
    this.rotation += 0.05;
  }
  
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    
    // Glow effect
    for (let i = 3; i > 0; i--) {
      fill(red(this.colors[this.type]), green(this.colors[this.type]), blue(this.colors[this.type]), 50/i);
      ellipse(0, 0, this.size * (1 + i/3));
    }
    
    // Base
    fill(this.colors[this.type]);
    ellipse(0, 0, this.size);
    
    // Icon based on type
    fill(255);
    if (this.type === 0) { // Extra life
      beginShape();
      vertex(-this.size/4, -this.size/8);
      vertex(-this.size/8, -this.size/8);
      vertex(-this.size/8, -this.size/4);
      vertex(this.size/8, -this.size/4);
      vertex(this.size/8, -this.size/8);
      vertex(this.size/4, -this.size/8);
      vertex(this.size/4, this.size/8);
      vertex(this.size/8, this.size/8);
      vertex(this.size/8, this.size/4);
      vertex(-this.size/8, this.size/4);
      vertex(-this.size/8, this.size/8);
      vertex(-this.size/4, this.size/8);
      endShape(CLOSE);
    } else if (this.type === 1) { // Shield
      noFill();
      stroke(255);
      strokeWeight(2);
      arc(0, 0, this.size * 0.7, this.size * 0.7, PI + QUARTER_PI, TWO_PI + QUARTER_PI);
      line(-this.size/6, this.size/6, this.size/6, this.size/6);
      noStroke();
    } else if (this.type === 2) { // Clear enemies
      ellipse(0, 0, this.size * 0.5);
      for (let i = 0; i < 8; i++) {
        let angle = map(i, 0, 8, 0, TWO_PI);
        line(0, 0, cos(angle) * this.size/3, sin(angle) * this.size/3);
      }
    }
    
    pop();
  }
  
  hits(target) {
    let d = dist(this.x, this.y, target.x, target.y);
    return d < this.size/2 + target.size/2;
  }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 3);
    this.speed = map(this.size, 1, 3, 0.5, 2);
    this.brightness = random(100, 255);
    this.twinkleSpeed = random(0.03, 0.07);
  }
  
  update() {
    this.y += this.speed;
    
    // Reset star when it goes off screen
    if (this.y > height) {
      this.y = 0;
      this.x = random(width);
    }
    
    // Twinkle effect
    this.brightness = 150 + 105 * sin(frameCount * this.twinkleSpeed);
  }
  
  display() {
    // Calculate star color based on size (smaller = more blue, larger = more yellow)
    let starColor = color(
      this.brightness,
      this.brightness,
      min(255, this.brightness + map(this.size, 1, 3, 50, 0))
    );
    
    fill(starColor);
    ellipse(this.x, this.y, this.size);
  }
}