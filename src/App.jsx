import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef(null);

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
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "green";
    ctx.font = "12px monospace";
    ctx.fillText("Hello Canvas", 10, 70);
  }, []);

  return (
    <div>
      <canvas ref={canvasRef}>
        An alternative text describing what your canvas displays.
      </canvas>
    </div>
  );
}

export default App;
