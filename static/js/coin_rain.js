class CoinRain {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.coins = [];
    this.basket = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 50,
      width: 100,
      height: 50
    };
    this.score = 0;
    this.isRunning = false;
    this.particles = []; // Add particle effects

    // Improved touch and mouse handling
    this.canvas.addEventListener('mousemove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      this.basket.x = Math.max(0, Math.min(x - this.basket.width / 2, this.canvas.width - this.basket.width));
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      this.basket.x = Math.max(0, Math.min(x - this.basket.width / 2, this.canvas.width - this.basket.width));
    });
  }

  createCoin() {
    return {
      x: Math.random() * (this.canvas.width - 30),
      y: -30,
      size: 30,
      speed: 2 + Math.random() * 3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2
    };
  }

  createParticle(x, y, color) {
    return {
      x,
      y,
      color,
      speed: Math.random() * 4 - 2,
      vy: -Math.random() * 4 - 2,
      size: Math.random() * 4 + 2,
      life: 1
    };
  }

  drawCoin(coin) {
    this.ctx.save();
    this.ctx.translate(coin.x + coin.size/2, coin.y + coin.size/2);
    this.ctx.rotate(coin.rotation);

    // Draw coin with gradient
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, coin.size/2);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(1, '#DAA520');

    this.ctx.beginPath();
    this.ctx.arc(0, 0, coin.size/2, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.strokeStyle = '#B8860B';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw $ symbol
    this.ctx.fillStyle = '#B8860B';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('$', 0, 0);

    this.ctx.restore();
  }

  drawBasket() {
    // Draw basket with gradient
    const gradient = this.ctx.createLinearGradient(
      this.basket.x,
      this.basket.y,
      this.basket.x,
      this.basket.y + this.basket.height
    );
    gradient.addColorStop(0, '#A0522D');
    gradient.addColorStop(1, '#8B4513');

    this.ctx.fillStyle = gradient;
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 3;

    // Draw basket shape
    this.ctx.beginPath();
    this.ctx.moveTo(this.basket.x, this.basket.y);
    this.ctx.lineTo(this.basket.x + this.basket.width, this.basket.y);
    this.ctx.lineTo(this.basket.x + this.basket.width - 10, this.basket.y + this.basket.height);
    this.ctx.lineTo(this.basket.x + 10, this.basket.y + this.basket.height);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawParticles() {
    this.particles.forEach((particle, index) => {
      particle.x += particle.speed;
      particle.y += particle.vy;
      particle.vy += 0.1;
      particle.life -= 0.02;

      if (particle.life <= 0) {
        this.particles.splice(index, 1);
        return;
      }

      this.ctx.globalAlpha = particle.life;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1;
    });
  }

  drawScore() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 4;
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    this.ctx.shadowBlur = 0;
  }

  update() {
    // Update coins
    this.coins.forEach((coin, index) => {
      coin.y += coin.speed;
      coin.rotation += coin.rotationSpeed;

      // Improved collision detection with the basket
      const coinCenterX = coin.x + coin.size/2;
      const coinCenterY = coin.y + coin.size/2;

      if (coinCenterY > this.basket.y && 
          coinCenterY < this.basket.y + this.basket.height &&
          coinCenterX > this.basket.x && 
          coinCenterX < this.basket.x + this.basket.width) {
        // Create particle effect on collection
        for (let i = 0; i < 8; i++) {
          this.particles.push(this.createParticle(
            coinCenterX,
            coinCenterY,
            '#FFD700'
          ));
        }
        this.coins.splice(index, 1);
        this.score++;
        document.getElementById('score').textContent = `Score: ${this.score}`;
      }

      // Remove coins that fall off screen
      if (coin.y > this.canvas.height) {
        this.coins.splice(index, 1);
      }
    });

    // Dynamic coin spawn rate based on score
    const spawnRate = Math.min(0.05 + (this.score / 500), 0.15);
    if (Math.random() < spawnRate) {
      this.coins.push(this.createCoin());
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.coins.forEach(coin => this.drawCoin(coin));
    this.drawBasket();
    this.drawParticles();
    this.drawScore();
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.update();
    this.draw();

    // End game after 30 seconds
    if (Date.now() - this.startTime > 30000) {
      this.isRunning = false;
      if (this.onGameOver) {
        this.onGameOver(this.score);
      }
      return;
    }

    requestAnimationFrame(() => this.gameLoop());
  }

  start() {
    this.score = 0;
    this.coins = [];
    this.particles = [];
    this.isRunning = true;
    this.startTime = Date.now();
    this.gameLoop();
  }
}