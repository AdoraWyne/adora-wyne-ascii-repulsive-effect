import { useRef } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  return (
    <div>
      <canvas width="120" height="120" ref={canvasRef}>
        An alternative text describing what your canvas displays.
      </canvas>
    </div>
  );
}

export default App;
