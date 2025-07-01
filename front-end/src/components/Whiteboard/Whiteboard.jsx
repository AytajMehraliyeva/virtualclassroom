import React, { useRef, useState, useEffect } from 'react';
import './Whiteboard.scss'
function Whiteboard({ socket, roomId }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [eraserMode, setEraserMode] = useState(false);
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    if (!socket) return;

    socket.on('draw', ({ x0, y0, x1, y1, color, lineWidth }) => {
      drawLine(x0, y0, x1, y1, color, lineWidth, false);
    });

    return () => {
      socket.off('draw');
    };
  }, [socket]);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  };

  const drawLine = (x0, y0, x1, y1, color, lineWidth, emit) => {
    const ctx = getCanvasContext();
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();

    if (!emit) return;
    socket.emit('draw', { roomId, x0, y0, x1, y1, color, lineWidth });
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    canvasRef.current.lastX = offsetX;
    canvasRef.current.lastY = offsetY;
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = e.nativeEvent;
    const c = canvasRef.current;
    const drawColor = eraserMode ? '#ffffff' : color;

    drawLine(c.lastX, c.lastY, offsetX, offsetY, drawColor, lineWidth, true);
    c.lastX = offsetX;
    c.lastY = offsetY;
  };

  const handleMouseUp = () => setIsDrawing(false);

  const toggleEraser = () => setEraserMode(!eraserMode);

  const clearCanvas = () => {
    const ctx = getCanvasContext();
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    socket.emit('clear', roomId);
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('clear', () => {
      const ctx = getCanvasContext();
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    });
    return () => socket.off('clear');
  }, [socket]);

  return (
    <div className="whiteboard-container">
   
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="whiteboard-canvas"
      />
 <div className="toolbar">
        <input className='color'
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          disabled={eraserMode}
        />
        <button className='eraser' onClick={toggleEraser}>
          {eraserMode ? 'Disable Eraser' : 'Enable Eraser'}
        </button>
        <button  onClick={clearCanvas}>Clear</button>
        <label>
          Size
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}

export default Whiteboard;
