import { APP_CONFIG } from './store';

const CanvasHelper = {
    setupRetina: (canvas, ctx) => {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.scale(dpr, dpr);
        return { w: rect.width, h: rect.height };
    }
};

class EffectEngineClass {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.waves = [];
        this.rAF = null;
        this.pWidth = 0;
        this.pHeight = 0;
        this.resize = this.resize.bind(this);
        this.loop = this.loop.bind(this);
    }

    mount(containerElement) {
        if (!containerElement) return;
        if (this.canvas) {
            this.canvas.remove();
            cancelAnimationFrame(this.rAF);
        }
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.inset = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '10';

        // ensure container is positioned relative
        if (window.getComputedStyle(containerElement).position === 'static') {
            containerElement.style.position = 'relative';
        }

        containerElement.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d', { alpha: true });

        window.addEventListener('resize', this.resize);
        this.resize();
        this.particles = [];
        this.waves = [];
        this.loop();
    }

    unmount() {
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
            cancelAnimationFrame(this.rAF);
        }
        window.removeEventListener('resize', this.resize);
    }

    resize() {
        if (!this.canvas || !this.ctx) return;
        const dims = CanvasHelper.setupRetina(this.canvas, this.ctx);
        this.pWidth = dims.w;
        this.pHeight = dims.h;
    }

    addBurst(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = (i * Math.PI * 2) / count, speed = 2 + Math.random() * 3;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 2,
                alpha: 1,
                color: APP_CONFIG.PALETTE[i % APP_CONFIG.PALETTE.length]
            });
        }
    }

    addWave(x, y, color = '#34d399') {
        this.waves.push({ x, y, r: 0, alpha: 0.8, color });
    }

    loop() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.pWidth, this.pHeight);

        for (let i = this.waves.length - 1; i >= 0; i--) {
            const w = this.waves[i]; w.r += 3; w.alpha -= 0.04;
            this.ctx.beginPath(); this.ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(52, 211, 153, ${w.alpha})`; this.ctx.lineWidth = 2; this.ctx.stroke();
            if (w.alpha <= 0) this.waves.splice(i, 1);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i]; p.x += p.vx; p.y += p.vy; p.alpha -= 0.03; p.size *= 0.95;
            this.ctx.globalAlpha = Math.max(0, p.alpha); this.ctx.fillStyle = p.color;
            this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); this.ctx.fill();
            if (p.alpha <= 0) this.particles.splice(i, 1);
        }
        this.ctx.globalAlpha = 1;
        this.rAF = requestAnimationFrame(this.loop);
    }
}

export const EffectEngine = new EffectEngineClass();
