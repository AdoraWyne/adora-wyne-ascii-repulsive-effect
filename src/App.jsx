import { useCallback, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const displayW = 700;
    const displayH = 200;

    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;

    canvas.style.width = displayW + "px";
    canvas.style.height = displayH + "px";

    const ctx = canvas.getContext("2d");
    ctx.save(); // snapshot the clean state
    ctx.scale(dpr, dpr);
    ctx.font = "bold 120px Georgia, serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "pink";
    ctx.fillText("adora wyne", displayW / 2, displayH / 2);
    ctx.restore();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const particles = [];
    const sampleStep = 5;
    const charPool = "abcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=-~:.";

    for (let y = 0; y < canvas.height; y += sampleStep) {
      for (let x = 0; x < canvas.width; x += sampleStep) {
        const i = (y * canvas.width + x) * 4; // index into flat array
        const alpha = pixels[i + 3]; // the A in RGBA

        if (alpha > 128) {
          const homeX = x / dpr;
          const homeY = y / dpr;
          particles.push({
            homeX,
            homeY,
            // Start scattered randomly around home position
            x: homeX + (Math.random() - 0.5) * displayW * 0.5,
            y: homeY + (Math.random() - 0.5) * displayH * 2.5,
            vx: 0,
            vy: 0,
            char: charPool[Math.floor(Math.random() * charPool.length)],
            // Stagger delay left-to-right based on x position
            delay: (homeX / displayW) * 1.2,
          });
        }
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillStyle = "rgba(255, 100, 160, 0.7)";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    for (const p of particles) {
      ctx.fillText(p.char, p.x, p.y);
    }

    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    if (particlesRef.current.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    let animId;
    const t0 = performance.now();

    const animate = (now) => {
      const elapsed = (now - t0) / 1000; // seconds since mount
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.font = "10px 'Courier New', monospace";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      for (const p of particles) {
        // How long since this particle's delay expired
        const t = Math.max(0, elapsed - p.delay);

        // Not yet active — draw faintly and skip physics
        if (t < 0.01) {
          ctx.fillStyle = "rgba(255, 100, 160, 0.05)";
          ctx.fillText(p.char, p.x, p.y);
          continue;
        }

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // FORCE 1: Repulsion
        if (dist < 50 && dist > 0.1) {
          const force = (1 - dist / 80) * (1 - dist / 80) * 50;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // FORCE 2: Spring back to home
        p.vx += (p.homeX - p.x) * 0.08;
        p.vy += (p.homeY - p.y) * 0.08;

        // FORCE 3: Friction
        p.vx *= 0.85;
        p.vy *= 0.85;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Draw — fade in during first 0.8s after delay
        const alpha = Math.min(t / 0.8, 1) * 0.7;
        ctx.fillStyle = `rgba(255, 100, 160, ${alpha})`;
        ctx.fillText(p.char, p.x, p.y);
      }

      ctx.restore();
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [particlesRef.current.length]);

  useEffect(() => {
    const charPool = "abcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=-~:.";

    const interval = setInterval(() => {
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        if (Math.random() < 0.03) {
          particles[i].char =
            charPool[Math.floor(Math.random() * charPool.length)];
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        cursor: "default",
      }}
    >
      <canvas ref={canvasRef}>
        An alternative text describing what your canvas displays.
      </canvas>
    </div>
  );
}

export default App;
