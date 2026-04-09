import { useCallback, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  // Convert screen coordinates to canvas coordinate space
  const updatePointer = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = canvas.width / (window.devicePixelRatio || 1) / rect.width;
    const scaleY = canvas.height / (window.devicePixelRatio || 1) / rect.height;
    mouseRef.current = {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const clearPointer = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  const handleMouseMove = useCallback(
    (e) => updatePointer(e.clientX, e.clientY),
    [updatePointer],
  );


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const charPool = "abcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=-~:.";
    let animId;
    let shuffleInterval;

    function setup() {
      // Cancel any running animation/interval from previous setup
      cancelAnimationFrame(animId);
      clearInterval(shuffleInterval);

      const dpr = window.devicePixelRatio || 1;
      const mouseRadius = 100;

      // Measure parent width for responsive sizing
      const displayW = parent.offsetWidth;

      // Scale font to fill the container width
      const baseFontSize = 120;
      const tmp = document.createElement("canvas").getContext("2d");
      tmp.font = `bold ${baseFontSize}px Georgia, serif`;
      const naturalW = tmp.measureText("adora wyne").width;
      const scaledFontSize = Math.floor(
        baseFontSize * (displayW / naturalW) * 0.9,
      );

      // Derive height from scaled font size
      const displayH = Math.ceil(scaledFontSize * 1.4);

      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;

      // Let CSS scale the canvas fluidly on resize
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.style.aspectRatio = `${displayW} / ${displayH}`;

      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.font = `bold ${scaledFontSize}px Georgia, serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillStyle = "pink";
      ctx.fillText("adora wyne", displayW / 2, displayH / 2);
      ctx.restore();

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      const particles = [];
      // Scale sample density and char size with the font size
      const sampleStep = Math.max(2, Math.round(scaledFontSize / 24));
      const charSize = Math.max(4, Math.round(scaledFontSize / 12));

      for (let y = 0; y < canvas.height; y += sampleStep) {
        for (let x = 0; x < canvas.width; x += sampleStep) {
          const i = (y * canvas.width + x) * 4;
          const alpha = pixels[i + 3];

          if (alpha > 128) {
            const homeX = x / dpr;
            const homeY = y / dpr;
            particles.push({
              homeX,
              homeY,
              x: homeX + (Math.random() - 0.5) * displayW * 0.5,
              y: homeY + (Math.random() - 0.5) * displayH * 2.5,
              vx: 0,
              vy: 0,
              char: charPool[Math.floor(Math.random() * charPool.length)],
              delay: (homeX / displayW) * 1.2,
            });
          }
        }
      }

      particlesRef.current = particles;

      // Animation loop
      const t0 = performance.now();

      const animate = (now) => {
        const elapsed = (now - t0) / 1000;
        const mouse = mouseRef.current;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.font = `${charSize}px 'Courier New', monospace`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        for (const p of particles) {
          const t = Math.max(0, elapsed - p.delay);

          if (t < 0.01) {
            ctx.fillStyle = "rgba(255, 100, 160, 0.05)";
            ctx.fillText(p.char, p.x, p.y);
            continue;
          }

          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // FORCE 1: Repulsion
          if (dist < mouseRadius && dist > 0.1) {
            const force = (1 - dist / 80) * (1 - dist / 80) * 50;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }

          // FORCE 2: Spring back to home
          p.vx += (p.homeX - p.x) * 0.04;
          p.vy += (p.homeY - p.y) * 0.04;

          // FORCE 3: Friction
          p.vx *= 0.85;
          p.vy *= 0.85;

          p.x += p.vx;
          p.y += p.vy;

          const a = Math.min(t / 0.8, 1) * 0.7;
          ctx.fillStyle = `rgba(255, 100, 160, ${a})`;
          ctx.fillText(p.char, p.x, p.y);
        }

        ctx.restore();
        animId = requestAnimationFrame(animate);
      };

      animId = requestAnimationFrame(animate);

      // Char shuffle
      shuffleInterval = setInterval(() => {
        for (let i = 0; i < particles.length; i++) {
          if (Math.random() < 0.03) {
            particles[i].char =
              charPool[Math.floor(Math.random() * charPool.length)];
          }
        }
      }, 300);
    }

    setup();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(shuffleInterval);
    };
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={clearPointer}
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
