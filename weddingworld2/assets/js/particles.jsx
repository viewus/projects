/**
 * Ambient Specks — a handful of soft, slow-drifting gold flecks on a
 * full-screen canvas. This intentionally replaces the old rose-petal /
 * gold-dust / cursor-sparkle particle engine: minimal luxury calls for a
 * few quiet flecks, not a continuous animation engine with mouse trails.
 * `prefers-reduced-motion` renders a single static frame instead of a loop.
 */

class AmbientSpeckField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.width = 0;
    this.height = 0;
    this.specks = [];
    this.isRunning = false;
    this.count = window.innerWidth <= 768 ? 8 : 14;
    this._raf = null;

    this.handleResize = this.handleResize.bind(this);
    this.handleResize();
    window.addEventListener('resize', this.handleResize, { passive: true });

    for (let i = 0; i < this.count; i++) this.specks.push(this.createSpeck(true));
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.count = this.width <= 768 ? 8 : 14;
  }

  createSpeck(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 10,
      radius: Math.random() * 1.4 + 0.6,
      alpha: Math.random() * 0.25 + 0.08,
      speedY: Math.random() * 0.18 + 0.06,
      driftPhase: Math.random() * Math.PI * 2,
      driftSpeed: Math.random() * 0.006 + 0.002
    };
  }

  update() {
    for (let i = 0; i < this.specks.length; i++) {
      const s = this.specks[i];
      s.y -= s.speedY;
      s.driftPhase += s.driftSpeed;
      s.x += Math.sin(s.driftPhase) * 0.15;
      if (s.y < -10) {
        this.specks[i] = this.createSpeck(false);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let i = 0; i < this.specks.length; i++) {
      const s = this.specks[i];
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(173, 138, 84, ${s.alpha})`;
      this.ctx.fill();
    }
  }

  loop() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this._raf = requestAnimationFrame(() => this.loop());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this._raf) cancelAnimationFrame(this._raf);
  }
}

const PetalsCanvas = React.forwardRef(function PetalsCanvas(props, ref) {
  const canvasRef = React.useRef(null);
  const engineRef = React.useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (!canvasRef.current) return undefined;
    const engine = new AmbientSpeckField(canvasRef.current);
    engineRef.current = engine;

    if (reducedMotion) {
      engine.draw();
    } else {
      engine.start();
    }

    return () => engine.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kept for API compatibility — the minimal ambient field has no burst effect.
  React.useImperativeHandle(ref, () => ({
    burst() {}
  }));

  return <canvas id="ambient-specks-canvas" ref={canvasRef} aria-hidden="true" />;
});
