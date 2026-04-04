import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "green";
    ctx.fillRect(10, 10, 100, 100);
  }, []);

  return (
    <div>
      <canvas width="120" height="120" ref={canvasRef}>
        An alternative text describing what your canvas displays.
      </canvas>
    </div>
  );
}

export default App;
