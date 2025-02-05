class SpinWheel {
  constructor(canvasId, segments) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.segments = segments;
    this.radius = Math.min(this.canvas.width, this.canvas.height) / 2 * 0.9;
    this.center = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    };
    this.rotation = 0;
    this.isSpinning = false;

    // Add shadow effect
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetX = 5;
    this.ctx.shadowOffsetY = 5;

    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw segments with improved graphics
    const anglePerSegment = (Math.PI * 2) / this.segments.length;

    this.segments.forEach((segment, index) => {
      const startAngle = index * anglePerSegment + this.rotation;
      const endAngle = startAngle + anglePerSegment;

      // Draw segment with gradient
      const gradient = this.ctx.createRadialGradient(
        this.center.x, this.center.y, 0,
        this.center.x, this.center.y, this.radius
      );
      gradient.addColorStop(0, this.lightenColor(segment.color, 20));
      gradient.addColorStop(1, segment.color);

      this.ctx.beginPath();
      this.ctx.moveTo(this.center.x, this.center.y);
      this.ctx.arc(this.center.x, this.center.y, this.radius, startAngle, endAngle);
      this.ctx.closePath();

      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Draw text with better visibility
      this.ctx.save();
      this.ctx.translate(this.center.x, this.center.y);
      this.ctx.rotate(startAngle + anglePerSegment / 2);
      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 18px Arial';
      // Add text shadow for better contrast
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      this.ctx.fillText(segment.text, this.radius - 30, 6);
      this.ctx.restore();
    });

    // Draw center circle with metallic effect
    const centerGradient = this.ctx.createRadialGradient(
      this.center.x - 5, this.center.y - 5, 2,
      this.center.x, this.center.y, 25
    );
    centerGradient.addColorStop(0, '#ffffff');
    centerGradient.addColorStop(1, '#d0d0d0');

    this.ctx.beginPath();
    this.ctx.arc(this.center.x, this.center.y, 25, 0, Math.PI * 2);
    this.ctx.fillStyle = centerGradient;
    this.ctx.fill();
    this.ctx.strokeStyle = '#a0a0a0';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw pointer
    this.ctx.beginPath();
    this.ctx.moveTo(this.center.x - 20, this.center.y - this.radius - 10);
    this.ctx.lineTo(this.center.x + 20, this.center.y - this.radius - 10);
    this.ctx.lineTo(this.center.x, this.center.y - this.radius + 20);
    this.ctx.closePath();
    this.ctx.fillStyle = '#ff3333';
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 5;
    this.ctx.fill();
  }

  // Helper function to lighten colors
  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16)
      .slice(1);
  }

  spin() {
    return new Promise((resolve) => {
      if (this.isSpinning) return;
      this.isSpinning = true;

      // Improved spin animation
      const totalRotation = Math.PI * 2 * (10 + Math.random() * 5); // 10-15 full rotations
      const duration = 6; // seconds

      const startRotation = this.rotation;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        // Enhanced easing function for more realistic spin
        const easing = 1 - Math.pow(1 - progress, 4); // Quartic easing out
        this.rotation = startRotation + totalRotation * easing;

        this.draw();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.isSpinning = false;

          // Calculate winning segment
          const normalizedRotation = this.rotation % (Math.PI * 2);
          const segmentAngle = (Math.PI * 2) / this.segments.length;
          const winningIndex = Math.floor(normalizedRotation / segmentAngle);
          resolve(this.segments[winningIndex]);
        }
      };

      animate();
    });
  }
}