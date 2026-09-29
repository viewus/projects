/**
 * Ultra-Luxury Instagram Reel-Style Particle Engine
 * Continuous 3D Falling Rose Petals, Floating Gold Dust Bokeh, and Interactive Sparkle Trails
 */
(function () {
  'use strict';

  class RoyalParticleEngine {
    constructor() {
      this.canvas = null;
      this.ctx = null;
      this.width = 0;
      this.height = 0;
      this.particles = [];
      this.petals = [];
      this.sparkles = [];
      this.isRunning = false;
      this.maxPetals = window.innerWidth <= 768 ? 16 : 28;
      this.maxParticles = window.innerWidth <= 768 ? 30 : 65;
      this.mousePos = { x: -100, y: -100, isMoving: false };
      this.lastSpawnTime = 0;

      this.init();
    }

    init() {
      // Create canvas container if not present
      this.canvas = document.getElementById('royal-petals-canvas');
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'royal-petals-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.inset = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '10001';
        this.canvas.style.opacity = '0.9';
        document.body.appendChild(this.canvas);
      }

      this.ctx = this.canvas.getContext('2d', { alpha: true });
      this.handleResize();

      window.addEventListener('resize', () => this.handleResize(), { passive: true });
      window.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });
      window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });

      // Seed initial particles
      for (let i = 0; i < this.maxParticles; i++) {
        this.particles.push(this.createGoldDust(true));
      }
      for (let i = 0; i < this.maxPetals; i++) {
        this.petals.push(this.createRosePetal(true));
      }

      this.start();
    }

    handleResize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * (window.devicePixelRatio > 1 ? 1.5 : 1);
      this.canvas.height = this.height * (window.devicePixelRatio > 1 ? 1.5 : 1);
      this.ctx.scale(
        this.canvas.width / this.width,
        this.canvas.height / this.height
      );
      this.maxPetals = this.width <= 768 ? 14 : 26;
      this.maxParticles = this.width <= 768 ? 25 : 55;
    }

    handleMouseMove(e) {
      this.mousePos.x = e.clientX;
      this.mousePos.y = e.clientY;
      this.spawnCursorSparkle(e.clientX, e.clientY);
    }

    handleTouchMove(e) {
      if (e.touches && e.touches[0]) {
        this.mousePos.x = e.touches[0].clientX;
        this.mousePos.y = e.touches[0].clientY;
        this.spawnCursorSparkle(e.touches[0].clientX, e.touches[0].clientY);
      }
    }

    spawnCursorSparkle(x, y) {
      const now = performance.now();
      if (now - this.lastSpawnTime < 35) return;
      this.lastSpawnTime = now;

      for (let i = 0; i < 2; i++) {
        this.sparkles.push({
          x: x + (Math.random() - 0.5) * 15,
          y: y + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 1.8,
          vy: (Math.random() - 0.5) * 1.8 - 0.5,
          size: Math.random() * 3.5 + 1.5,
          life: 1.0,
          decay: Math.random() * 0.03 + 0.02,
          color: Math.random() > 0.3 ? '#f7d77e' : '#ffffff',
          rotation: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.1
        });
      }
    }

    createGoldDust(randomY = false) {
      return {
        x: Math.random() * this.width,
        y: randomY ? Math.random() * this.height : -10,
        radius: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.7 + 0.2,
        speedY: Math.random() * 0.6 + 0.2,
        speedX: (Math.random() - 0.5) * 0.4,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        pulseAngle: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.4 ? 'rgba(247, 215, 126,' : 'rgba(255, 235, 160,'
      };
    }

    createRosePetal(randomY = false) {
      const isCrimson = Math.random() > 0.35;
      return {
        x: Math.random() * this.width,
        y: randomY ? Math.random() * this.height : -30,
        size: Math.random() * 12 + 10,
        ratio: Math.random() * 0.5 + 0.8,
        speedY: Math.random() * 1.2 + 0.8,
        speedX: Math.random() * 0.8 - 0.4,
        rotationX: Math.random() * Math.PI * 2,
        rotationY: Math.random() * Math.PI * 2,
        rotationZ: Math.random() * Math.PI * 2,
        rotSpeedX: Math.random() * 0.03 + 0.01,
        rotSpeedY: Math.random() * 0.04 + 0.01,
        rotSpeedZ: Math.random() * 0.02 + 0.005,
        swingOffset: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.01,
        color1: isCrimson ? '#c9184a' : '#d4af37',
        color2: isCrimson ? '#800f2f' : '#aa7c11',
        alpha: Math.random() * 0.4 + 0.55
      };
    }

    burstPetals(count = 35) {
      for (let i = 0; i < count; i++) {
        const petal = this.createRosePetal(false);
        petal.y = this.height * 0.5 + (Math.random() - 0.5) * 200;
        petal.x = this.width * 0.5 + (Math.random() - 0.5) * 200;
        petal.speedY = (Math.random() - 0.5) * 6;
        petal.speedX = (Math.random() - 0.5) * 8;
        petal.size = Math.random() * 16 + 12;
        this.petals.push(petal);
      }
    }

    update() {
      // 1. Update Gold Dust
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulseAngle += p.pulseSpeed;

        if (p.y > this.height + 10 || p.x < -10 || p.x > this.width + 10) {
          this.particles[i] = this.createGoldDust(false);
        }
      }

      // 2. Update Rose Petals
      for (let i = 0; i < this.petals.length; i++) {
        const p = this.petals[i];
        p.y += p.speedY;
        p.swingOffset += p.swingSpeed;
        p.x += p.speedX + Math.sin(p.swingOffset) * 1.1;

        p.rotationX += p.rotSpeedX;
        p.rotationY += p.rotSpeedY;
        p.rotationZ += p.rotSpeedZ;

        if (p.y > this.height + 40 || p.x < -40 || p.x > this.width + 40) {
          if (this.petals.length > this.maxPetals) {
            this.petals.splice(i, 1);
            i--;
          } else {
            this.petals[i] = this.createRosePetal(false);
          }
        }
      }

      // 3. Update Sparkles
      for (let i = 0; i < this.sparkles.length; i++) {
        const s = this.sparkles[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        s.rotation += s.spin;

        if (s.life <= 0) {
          this.sparkles.splice(i, 1);
          i--;
        }
      }
    }

    draw() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Draw Gold Dust Bokeh
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        const currentAlpha = Math.max(0.1, p.alpha * (0.6 + Math.sin(p.pulseAngle) * 0.4));
        
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `${p.hue} ${currentAlpha})`;
        this.ctx.shadowColor = '#f5d77f';
        this.ctx.shadowBlur = 6;
        this.ctx.fill();
      }

      // Draw Rose & Gold Petals in 3D perspective
      for (let i = 0; i < this.petals.length; i++) {
        const p = this.petals[i];
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotationZ);
        
        // 3D scale simulation with cos(rotation)
        const scaleX = Math.cos(p.rotationX);
        const scaleY = Math.sin(p.rotationY) * p.ratio;
        this.ctx.scale(Math.abs(scaleX) > 0.05 ? scaleX : 0.05, Math.abs(scaleY) > 0.05 ? scaleY : 0.05);

        // Draw organic curved petal path
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.6, p.size * 0.8, p.size * 0.6, 0, p.size);
        this.ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.6, -p.size * 0.8, -p.size * 0.6, 0, -p.size);

        // Gradient coloring
        const grad = this.ctx.createLinearGradient(0, -p.size, 0, p.size);
        grad.addColorStop(0, p.color1);
        grad.addColorStop(1, p.color2);
        
        this.ctx.fillStyle = grad;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        this.ctx.shadowBlur = 4;
        this.ctx.fill();
        this.ctx.restore();
      }

      // Draw Sparkles (Star Glints)
      for (let i = 0; i < this.sparkles.length; i++) {
        const s = this.sparkles[i];
        this.ctx.save();
        this.ctx.translate(s.x, s.y);
        this.ctx.rotate(s.rotation);
        this.ctx.globalAlpha = Math.max(0, s.life);

        const r = s.size;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -r * 1.6);
        this.ctx.quadraticCurveTo(0, 0, r * 1.6, 0);
        this.ctx.quadraticCurveTo(0, 0, 0, r * 1.6);
        this.ctx.quadraticCurveTo(0, 0, -r * 1.6, 0);
        this.ctx.quadraticCurveTo(0, 0, 0, -r * 1.6);
        this.ctx.fillStyle = s.color;
        this.ctx.shadowColor = '#ffffff';
        this.ctx.shadowBlur = 8;
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    loop() {
      if (!this.isRunning) return;
      this.update();
      this.draw();
      requestAnimationFrame(() => this.loop());
    }

    start() {
      if (this.isRunning) return;
      this.isRunning = true;
      this.loop();
    }

    stop() {
      this.isRunning = false;
    }
  }

  // Expose globally
  window.RoyalParticles = {
    init: () => {
      if (!window.__royalParticleEngine) {
        window.__royalParticleEngine = new RoyalParticleEngine();
      }
      return window.__royalParticleEngine;
    },
    burst: (count) => {
      if (window.__royalParticleEngine) {
        window.__royalParticleEngine.burstPetals(count);
      }
    }
  };

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.RoyalParticles.init());
  } else {
    window.RoyalParticles.init();
  }
})();
