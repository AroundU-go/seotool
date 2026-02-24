import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    originX: number;
    originY: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
}

interface BackgroundParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    phase: number;
}

const PARTICLE_DENSITY = 0.00012;
const BG_PARTICLE_DENSITY = 0.00004;
const MOUSE_RADIUS = 180;
const RETURN_SPEED = 0.08;
const DAMPING = 0.90;
const REPULSION_STRENGTH = 1.2;

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

const ParticleCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const bgParticlesRef = useRef<BackgroundParticle[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000, isActive: false });
    const frameIdRef = useRef(0);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('dark'));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const initParticles = useCallback((width: number, height: number) => {
        const count = Math.floor(width * height * PARTICLE_DENSITY);
        const particles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            particles.push({
                x, y, originX: x, originY: y, vx: 0, vy: 0,
                size: randomRange(1, 2.5),
                color: Math.random() > 0.85 ? '#75DDFF' : (isDark ? '#ffffff' : '#1e293b'),
            });
        }
        particlesRef.current = particles;

        const bgCount = Math.floor(width * height * BG_PARTICLE_DENSITY);
        const bg: BackgroundParticle[] = [];
        for (let i = 0; i < bgCount; i++) {
            bg.push({
                x: Math.random() * width, y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
                size: randomRange(0.5, 1.5), alpha: randomRange(0.1, 0.4),
                phase: Math.random() * Math.PI * 2,
            });
        }
        bgParticlesRef.current = bg;
    }, [isDark]);

    const animate = useCallback((time: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background glow
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const pulseOpacity = Math.sin(time * 0.0008) * 0.035 + 0.085;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(canvas.width, canvas.height) * 0.7);
        gradient.addColorStop(0, `rgba(117, 221, 255, ${pulseOpacity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Background particles
        const bgParticles = bgParticlesRef.current;
        const dark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = dark ? '#ffffff' : '#334155';
        for (const p of bgParticles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            const twinkle = Math.sin(time * 0.002 + p.phase) * 0.5 + 0.5;
            ctx.globalAlpha = p.alpha * (0.3 + 0.7 * twinkle);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Main particles
        const particles = particlesRef.current;
        const mouse = mouseRef.current;

        for (const p of particles) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (mouse.isActive && distance < MOUSE_RADIUS) {
                const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
                p.vx -= (dx / distance) * force * REPULSION_STRENGTH * 5;
                p.vy -= (dy / distance) * force * REPULSION_STRENGTH * 5;
            }

            p.vx += (p.originX - p.x) * RETURN_SPEED;
            p.vy += (p.originY - p.y) * RETURN_SPEED;
        }

        // Integrate & draw
        for (const p of particles) {
            p.vx *= DAMPING;
            p.vy *= DAMPING;
            p.x += p.vx;
            p.y += p.vy;

            const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const opacity = Math.min(0.3 + velocity * 0.1, 1);

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            if (p.color === '#75DDFF') {
                ctx.fillStyle = `rgba(117, 221, 255, ${opacity})`;
            } else if (dark) {
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            } else {
                ctx.fillStyle = `rgba(30, 41, 59, ${opacity * 0.6})`;
            }
            ctx.fill();
        }

        frameIdRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current || !canvasRef.current) return;
            const { width, height } = containerRef.current.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvasRef.current.width = width * dpr;
            canvasRef.current.height = height * dpr;
            canvasRef.current.style.width = `${width}px`;
            canvasRef.current.style.height = `${height}px`;
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) ctx.scale(dpr, dpr);
            initParticles(width, height);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [initParticles]);

    useEffect(() => {
        frameIdRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameIdRef.current);
    }, [animate]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                mouseRef.current = { x, y, isActive: true };
            } else {
                mouseRef.current.isActive = false;
            }
        };

        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden"
            style={{ pointerEvents: 'none', zIndex: -1 }}
        >
            <canvas ref={canvasRef} className="absolute inset-0" style={{ pointerEvents: 'none' }} />
        </div>
    );
};

export default ParticleCanvas;
